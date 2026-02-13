import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  async getWeekSchedule(courierId: string, weekStart: string) {
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const bookedSlots = await this.prisma.courierScheduleSlot.findMany({
      where: {
        courierId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const schedule = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const daySlots = this.generateTimeSlots(date);
      const bookedForDay = bookedSlots.filter(
        slot => slot.date.toDateString() === date.toDateString()
      );

      schedule.push({
        date: date.toISOString().split('T')[0],
        slots: daySlots.map(slot => ({
          ...slot,
          booked: bookedForDay.some(
            b => b.startTime === slot.startTime && b.endTime === slot.endTime
          ),
        })),
      });
    }

    return schedule;
  }

  async bookShift(courierId: string, slotId: string, date: string) {
    const slotDate = new Date(date);
    
    const existing = await this.prisma.courierScheduleSlot.findFirst({
      where: {
        courierId,
        date: slotDate,
      },
    });

    if (existing) {
      throw new BadRequestException('You already have a shift booked for this day');
    }

    const slot = this.getSlotById(slotId);
    if (!slot) {
      throw new BadRequestException('Invalid slot ID');
    }

    return this.prisma.courierScheduleSlot.create({
      data: {
        courierId,
        date: slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        demand: slot.demand,
        surgeMultiplier: slot.surgeMultiplier,
      },
    });
  }

  async dropShift(courierId: string, slotId: string) {
    const slot = await this.prisma.courierScheduleSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot || slot.courierId !== courierId) {
      throw new BadRequestException('Shift not found or does not belong to you');
    }

    await this.prisma.courierScheduleSlot.delete({
      where: { id: slotId },
    });

    return { message: 'Shift dropped successfully' };
  }

  async getMyShifts(courierId: string) {
    const now = new Date();
    
    return this.prisma.courierScheduleSlot.findMany({
      where: {
        courierId,
        date: { gte: now },
      },
      orderBy: { date: 'asc' },
    });
  }

  private generateTimeSlots(date: Date) {
    const slots = [
      { id: '1', startTime: '6:00 AM', endTime: '9:00 AM', demand: 'medium', spotsLeft: 5, totalSpots: 15, estimatedEarnings: 12000, surgeMultiplier: 1.2 },
      { id: '2', startTime: '9:00 AM', endTime: '12:00 PM', demand: 'high', spotsLeft: 2, totalSpots: 20, estimatedEarnings: 18000, surgeMultiplier: 1.5 },
      { id: '3', startTime: '12:00 PM', endTime: '3:00 PM', demand: 'peak', spotsLeft: 0, totalSpots: 25, estimatedEarnings: 25000, surgeMultiplier: 1.8 },
      { id: '4', startTime: '3:00 PM', endTime: '6:00 PM', demand: 'medium', spotsLeft: 8, totalSpots: 15, estimatedEarnings: 15000, surgeMultiplier: 1.3 },
      { id: '5', startTime: '6:00 PM', endTime: '9:00 PM', demand: 'peak', spotsLeft: 1, totalSpots: 25, estimatedEarnings: 28000, surgeMultiplier: 2.0 },
      { id: '6', startTime: '9:00 PM', endTime: '12:00 AM', demand: 'low', spotsLeft: 12, totalSpots: 15, estimatedEarnings: 10000, surgeMultiplier: 1.0 },
    ];

    return slots;
  }

  private getSlotById(slotId: string) {
    const slots = {
      '1': { startTime: '6:00 AM', endTime: '9:00 AM', demand: 'medium', surgeMultiplier: 1.2 },
      '2': { startTime: '9:00 AM', endTime: '12:00 PM', demand: 'high', surgeMultiplier: 1.5 },
      '3': { startTime: '12:00 PM', endTime: '3:00 PM', demand: 'peak', surgeMultiplier: 1.8 },
      '4': { startTime: '3:00 PM', endTime: '6:00 PM', demand: 'medium', surgeMultiplier: 1.3 },
      '5': { startTime: '6:00 PM', endTime: '9:00 PM', demand: 'peak', surgeMultiplier: 2.0 },
      '6': { startTime: '9:00 PM', endTime: '12:00 AM', demand: 'low', surgeMultiplier: 1.0 },
    };

    return slots[slotId];
  }
}
