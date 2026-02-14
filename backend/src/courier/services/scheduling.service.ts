import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  // ─── Tier-based booking window (days ahead a courier can book) ───
  private getBookingWindowDays(rating: number, totalDeliveries: number): number {
    // Excellent: 4.8+ rating AND 200+ deliveries → 7 days
    if (rating >= 4.8 && totalDeliveries >= 200) return 7;
    // Good: 4.5+ rating AND 100+ deliveries → 5 days
    if (rating >= 4.5 && totalDeliveries >= 100) return 5;
    // Standard: everyone else → 3 days
    return 3;
  }

  private getTierName(rating: number, totalDeliveries: number): string {
    if (rating >= 4.8 && totalDeliveries >= 200) return 'excellent';
    if (rating >= 4.5 && totalDeliveries >= 100) return 'good';
    return 'standard';
  }

  // ─── Get week schedule with real capacity from DB ───
  async getWeekSchedule(courierId: string, weekStart: string, zone = 'default') {
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    // Get courier tier for booking window
    const driverProfile = await this.prisma.driverProfile.findUnique({
      where: { userId: courierId },
    });
    const rating = driverProfile ? Number(driverProfile.rating) : 5.0;
    const totalDeliveries = driverProfile?.totalDeliveries || 0;
    const bookingWindowDays = this.getBookingWindowDays(rating, totalDeliveries);
    const tier = this.getTierName(rating, totalDeliveries);

    // Check for active booking ban
    const activeBan = await this.prisma.scheduleNoShow.findFirst({
      where: {
        courierId,
        penalty: 'booking_ban',
        resolved: false,
      },
    });

    // Get global schedule slots for this zone
    const globalSlots = await this.prisma.scheduleSlot.findMany({
      where: { zone, active: true },
      orderBy: { sortOrder: 'asc' },
    });

    // Get courier's bookings for this week
    const myBookings = await this.prisma.courierScheduleSlot.findMany({
      where: {
        courierId,
        zone,
        date: { gte: startDate, lt: endDate },
        status: { in: ['booked', 'completed'] },
      },
    });

    // Get all bookings for capacity count
    const allBookings = await this.prisma.courierScheduleSlot.findMany({
      where: {
        zone,
        date: { gte: startDate, lt: endDate },
        status: 'booked',
      },
      select: { scheduleSlotId: true, date: true },
    });

    // Get no-show count for penalty display
    const noShowCount = await this.prisma.scheduleNoShow.count({
      where: { courierId, resolved: false },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxBookDate = new Date(today);
    maxBookDate.setDate(maxBookDate.getDate() + bookingWindowDays);

    const schedule = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const canBook = date >= today && date < maxBookDate && !activeBan;

      const daySlots = globalSlots.map((slot) => {
        const bookedCount = allBookings.filter(
          (b) => b.scheduleSlotId === slot.id && b.date.toISOString().split('T')[0] === dateStr,
        ).length;
        const spotsLeft = Math.max(0, slot.totalSpots - bookedCount);
        const isBooked = myBookings.some(
          (b) => b.scheduleSlotId === slot.id && b.date.toISOString().split('T')[0] === dateStr,
        );
        const myBooking = myBookings.find(
          (b) => b.scheduleSlotId === slot.id && b.date.toISOString().split('T')[0] === dateStr,
        );

        return {
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          demand: slot.demand,
          spotsLeft,
          totalSpots: slot.totalSpots,
          estimatedEarnings: slot.estimatedEarnings,
          surgeMultiplier: slot.surgeMultiplier,
          booked: isBooked,
          bookingId: myBooking?.id || null,
          canBook: canBook && !isBooked && spotsLeft > 0,
        };
      });

      schedule.push({ date: dateStr, canBook, slots: daySlots });
    }

    return {
      schedule,
      tier,
      bookingWindowDays,
      noShowCount,
      banned: !!activeBan,
      zone,
    };
  }

  // ─── Book a shift (multiple per day allowed, overlap check) ───
  async bookShift(courierId: string, slotId: string, date: string, zone = 'default') {
    const slotDate = new Date(date);

    // Validate slot exists
    const globalSlot = await this.prisma.scheduleSlot.findUnique({
      where: { id: slotId },
    });
    if (!globalSlot || !globalSlot.active) {
      throw new BadRequestException('Invalid or inactive slot');
    }

    // Check booking ban
    const activeBan = await this.prisma.scheduleNoShow.findFirst({
      where: { courierId, penalty: 'booking_ban', resolved: false },
    });
    if (activeBan) {
      throw new ForbiddenException('You are temporarily banned from booking shifts due to repeated no-shows');
    }

    // Check tier-based booking window
    const driverProfile = await this.prisma.driverProfile.findUnique({
      where: { userId: courierId },
    });
    const rating = driverProfile ? Number(driverProfile.rating) : 5.0;
    const totalDeliveries = driverProfile?.totalDeliveries || 0;
    const bookingWindowDays = this.getBookingWindowDays(rating, totalDeliveries);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxBookDate = new Date(today);
    maxBookDate.setDate(maxBookDate.getDate() + bookingWindowDays);

    if (slotDate < today) {
      throw new BadRequestException('Cannot book shifts in the past');
    }
    if (slotDate >= maxBookDate) {
      throw new BadRequestException(
        `Your tier allows booking up to ${bookingWindowDays} days ahead. Improve your rating to unlock more.`,
      );
    }

    // Check for duplicate booking (same slot, same date)
    const existing = await this.prisma.courierScheduleSlot.findFirst({
      where: {
        courierId,
        scheduleSlotId: slotId,
        date: slotDate,
        status: 'booked',
      },
    });
    if (existing) {
      throw new BadRequestException('You already booked this slot');
    }

    // Check for time overlap on same day (allow multiple non-overlapping slots)
    const dayBookings = await this.prisma.courierScheduleSlot.findMany({
      where: {
        courierId,
        date: slotDate,
        zone,
        status: 'booked',
      },
    });
    for (const booking of dayBookings) {
      if (this.timesOverlap(booking.startTime, booking.endTime, globalSlot.startTime, globalSlot.endTime)) {
        throw new BadRequestException(`This slot overlaps with your existing ${booking.startTime} - ${booking.endTime} shift`);
      }
    }

    // Check capacity
    const bookedCount = await this.prisma.courierScheduleSlot.count({
      where: {
        scheduleSlotId: slotId,
        date: slotDate,
        status: 'booked',
      },
    });
    if (bookedCount >= globalSlot.totalSpots) {
      throw new BadRequestException('This slot is full');
    }

    // Auto-approve: create booking immediately
    const booking = await this.prisma.courierScheduleSlot.create({
      data: {
        courierId,
        scheduleSlotId: slotId,
        date: slotDate,
        startTime: globalSlot.startTime,
        endTime: globalSlot.endTime,
        demand: globalSlot.demand,
        surgeMultiplier: globalSlot.surgeMultiplier,
        zone,
        status: 'booked',
      },
    });

    return {
      ...booking,
      message: 'Shift booked successfully',
      spotsLeft: globalSlot.totalSpots - bookedCount - 1,
    };
  }

  // ─── Drop a shift ───
  async dropShift(courierId: string, bookingId: string) {
    const booking = await this.prisma.courierScheduleSlot.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.courierId !== courierId) {
      throw new BadRequestException('Shift not found or does not belong to you');
    }

    if (booking.status !== 'booked') {
      throw new BadRequestException('Can only drop booked shifts');
    }

    // Check if dropping less than 2 hours before — warn but allow
    const shiftStart = new Date(booking.date);
    const [hours] = this.parseTime(booking.startTime);
    shiftStart.setHours(hours);
    const hoursUntilShift = (shiftStart.getTime() - Date.now()) / (1000 * 60 * 60);

    await this.prisma.courierScheduleSlot.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    });

    const warning = hoursUntilShift < 2
      ? 'Late drop — this may affect your scheduling priority.'
      : null;

    return { message: 'Shift dropped successfully', warning };
  }

  // ─── Get my upcoming shifts ───
  async getMyShifts(courierId: string) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return this.prisma.courierScheduleSlot.findMany({
      where: {
        courierId,
        date: { gte: now },
        status: 'booked',
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  // ─── Check if a courier has a booked shift right now (for order priority) ───
  async hasActiveShift(courierId: string, zone = 'default'): Promise<boolean> {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const todayBookings = await this.prisma.courierScheduleSlot.findMany({
      where: {
        courierId,
        date: today,
        zone,
        status: 'booked',
      },
    });

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    return todayBookings.some((booking) => {
      const [startH, startM] = this.parseTime(booking.startTime);
      const [endH, endM] = this.parseTime(booking.endTime);
      const startMin = startH * 60 + startM;
      let endMin = endH * 60 + endM;
      if (endMin <= startMin) endMin += 24 * 60; // handle midnight crossover
      return currentTime >= startMin && currentTime < endMin;
    });
  }

  // ─── No-show detection (called by a cron or admin) ───
  async markNoShow(courierId: string, bookingId: string) {
    const booking = await this.prisma.courierScheduleSlot.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.courierId !== courierId) {
      throw new BadRequestException('Booking not found');
    }

    await this.prisma.courierScheduleSlot.update({
      where: { id: bookingId },
      data: { status: 'no_show' },
    });

    // Count recent no-shows
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentNoShows = await this.prisma.scheduleNoShow.count({
      where: {
        courierId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Escalating penalties: 1st = warning, 2nd = reduced_priority, 3+ = booking_ban
    let penalty = 'warning';
    if (recentNoShows >= 2) penalty = 'booking_ban';
    else if (recentNoShows >= 1) penalty = 'reduced_priority';

    await this.prisma.scheduleNoShow.create({
      data: {
        courierId,
        slotId: bookingId,
        date: booking.date,
        penalty,
      },
    });

    return { penalty, totalNoShows: recentNoShows + 1 };
  }

  // ─── Get no-show history for a courier ───
  async getNoShowHistory(courierId: string) {
    return this.prisma.scheduleNoShow.findMany({
      where: { courierId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // ─── Resolve a no-show penalty (admin action) ───
  async resolveNoShow(noShowId: string) {
    return this.prisma.scheduleNoShow.update({
      where: { id: noShowId },
      data: { resolved: true },
    });
  }

  // ─── Get available zones ───
  async getZones() {
    return this.prisma.scheduleZone.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  // ─── ADMIN: Get all schedule slots (global config) ───
  async getGlobalSlots(zone = 'default') {
    return this.prisma.scheduleSlot.findMany({
      where: { zone },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // ─── ADMIN: Create/update a schedule slot ───
  async upsertGlobalSlot(data: {
    id?: string;
    startTime: string;
    endTime: string;
    zone?: string;
    totalSpots?: number;
    demand?: string;
    surgeMultiplier?: number;
    estimatedEarnings?: number;
    active?: boolean;
    sortOrder?: number;
  }) {
    if (data.id) {
      return this.prisma.scheduleSlot.update({
        where: { id: data.id },
        data: {
          startTime: data.startTime,
          endTime: data.endTime,
          zone: data.zone,
          totalSpots: data.totalSpots,
          demand: data.demand,
          surgeMultiplier: data.surgeMultiplier,
          estimatedEarnings: data.estimatedEarnings,
          active: data.active,
          sortOrder: data.sortOrder,
        },
      });
    }
    return this.prisma.scheduleSlot.create({
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        zone: data.zone || 'default',
        totalSpots: data.totalSpots || 15,
        demand: data.demand || 'medium',
        surgeMultiplier: data.surgeMultiplier || 1.0,
        estimatedEarnings: data.estimatedEarnings || 15000,
        active: data.active ?? true,
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  // ─── ADMIN: Delete a schedule slot ───
  async deleteGlobalSlot(slotId: string) {
    await this.prisma.scheduleSlot.delete({ where: { id: slotId } });
    return { message: 'Slot deleted' };
  }

  // ─── ADMIN: Create/update a zone ───
  async upsertZone(data: {
    id?: string;
    key: string;
    name: string;
    latitude: number;
    longitude: number;
    radius?: number;
    active?: boolean;
  }) {
    if (data.id) {
      return this.prisma.scheduleZone.update({
        where: { id: data.id },
        data: {
          key: data.key,
          name: data.name,
          latitude: data.latitude,
          longitude: data.longitude,
          radius: data.radius,
          active: data.active,
        },
      });
    }
    return this.prisma.scheduleZone.create({
      data: {
        key: data.key,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius || 5.0,
        active: data.active ?? true,
      },
    });
  }

  // ─── ADMIN: Delete a zone ───
  async deleteZone(zoneId: string) {
    await this.prisma.scheduleZone.delete({ where: { id: zoneId } });
    return { message: 'Zone deleted' };
  }

  // ─── ADMIN: Get booking stats for a date range ───
  async getBookingStats(zone = 'default', startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date(start);
    end.setDate(end.getDate() + 7);

    const bookings = await this.prisma.courierScheduleSlot.findMany({
      where: {
        zone,
        date: { gte: start, lt: end },
      },
    });

    const totalBooked = bookings.filter((b) => b.status === 'booked').length;
    const totalCompleted = bookings.filter((b) => b.status === 'completed').length;
    const totalNoShows = bookings.filter((b) => b.status === 'no_show').length;
    const totalCancelled = bookings.filter((b) => b.status === 'cancelled').length;

    return {
      zone,
      period: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] },
      totalBooked,
      totalCompleted,
      totalNoShows,
      totalCancelled,
      fillRate: totalBooked > 0 ? Math.round((totalBooked / (totalBooked + totalCancelled + totalNoShows)) * 100) : 0,
    };
  }

  // ─── ADMIN: Get all no-shows (for review) ───
  async getAllNoShows(resolved = false) {
    return this.prisma.scheduleNoShow.findMany({
      where: { resolved },
      include: {
        courier: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ─── Helpers ───
  private timesOverlap(
    start1: string, end1: string,
    start2: string, end2: string,
  ): boolean {
    const [s1h, s1m] = this.parseTime(start1);
    const [e1h, e1m] = this.parseTime(end1);
    const [s2h, s2m] = this.parseTime(start2);
    const [e2h, e2m] = this.parseTime(end2);

    let s1 = s1h * 60 + s1m;
    let e1 = e1h * 60 + e1m;
    let s2 = s2h * 60 + s2m;
    let e2 = e2h * 60 + e2m;

    if (e1 <= s1) e1 += 24 * 60;
    if (e2 <= s2) e2 += 24 * 60;

    return s1 < e2 && s2 < e1;
  }

  private parseTime(timeStr: string): [number, number] {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return [0, 0];
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return [hours, minutes];
  }
}
