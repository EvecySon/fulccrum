import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessHoursService {
  private readonly logger = new Logger(BusinessHoursService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateBusinessOpenStatus() {
    try {
      const businesses = await this.prisma.businessProfile.findMany({
        where: {
          verificationStatus: 'approved',
          businessHours: { some: {} },
        },
        select: {
          userId: true,
          businessName: true,
          businessHours: true,
          isOpen: true,
        },
      });

      let updatedCount = 0;

      for (const business of businesses) {
        const shouldBeOpen = this.isOpenNow(business.businessHours);

        if (business.isOpen !== shouldBeOpen) {
          await this.prisma.businessProfile.update({
            where: { userId: business.userId },
            data: { isOpen: shouldBeOpen },
          });

          updatedCount++;
          this.logger.log(
            `Updated ${business.businessName} status to ${shouldBeOpen ? 'OPEN' : 'CLOSED'}`,
          );
        }
      }

      if (updatedCount > 0) {
        this.logger.log(`Updated ${updatedCount} business open/closed statuses`);
      }
    } catch (error) {
      this.logger.error('Error updating business open status:', error);
    }
  }

  /** Check if a business is open right now based on its BusinessHours rows */
  isOpenNow(hours: { dayOfWeek: number; openingTime: string; closingTime: string; isClosed: boolean }[]): boolean {
    if (!hours || hours.length === 0) return true; // Default open if no hours set

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    const todayHours = hours.find(h => h.dayOfWeek === dayOfWeek);
    if (!todayHours || todayHours.isClosed) return false;

    const { openingTime, closingTime } = todayHours;

    // Handle cases where closing time is past midnight
    if (closingTime < openingTime) {
      return currentTime >= openingTime || currentTime < closingTime;
    }

    return currentTime >= openingTime && currentTime < closingTime;
  }

  async setBusinessHours(businessId: string, hoursData: { dayOfWeek: number; openingTime: string; closingTime: string; isClosed?: boolean }[]) {
    // Upsert each day
    for (const day of hoursData) {
      await this.prisma.businessHours.upsert({
        where: { businessId_dayOfWeek: { businessId, dayOfWeek: day.dayOfWeek } },
        update: { openingTime: day.openingTime, closingTime: day.closingTime, isClosed: day.isClosed ?? false },
        create: { businessId, dayOfWeek: day.dayOfWeek, openingTime: day.openingTime, closingTime: day.closingTime, isClosed: day.isClosed ?? false },
      });
    }

    // Refresh open status
    const allHours = await this.prisma.businessHours.findMany({ where: { businessId } });
    const isOpen = this.isOpenNow(allHours);
    await this.prisma.businessProfile.update({ where: { userId: businessId }, data: { isOpen } });

    return allHours;
  }

  async toggleBusinessOpen(businessId: string, isOpen: boolean) {
    return this.prisma.businessProfile.update({
      where: { userId: businessId },
      data: { isOpen },
    });
  }

  async getBusinessHours(businessId: string) {
    const [hours, business] = await Promise.all([
      this.prisma.businessHours.findMany({
        where: { businessId },
        orderBy: { dayOfWeek: 'asc' },
      }),
      this.prisma.businessProfile.findUnique({
        where: { userId: businessId },
        select: { isOpen: true },
      }),
    ]);

    return {
      hours,
      isOpen: business?.isOpen ?? true,
      currentStatus: this.isOpenNow(hours),
    };
  }
}
