import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

interface BusinessHours {
  monday?: { open: string; close: string; closed?: boolean };
  tuesday?: { open: string; close: string; closed?: boolean };
  wednesday?: { open: string; close: string; closed?: boolean };
  thursday?: { open: string; close: string; closed?: boolean };
  friday?: { open: string; close: string; closed?: boolean };
  saturday?: { open: string; close: string; closed?: boolean };
  sunday?: { open: string; close: string; closed?: boolean };
}

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
          businessHours: { not: null },
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
        const shouldBeOpen = this.isBusinessOpen(business.businessHours as any);
        
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

  isBusinessOpen(businessHours: BusinessHours | null): boolean {
    if (!businessHours) {
      return true; // Default to open if no hours specified
    }

    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'lowercase' }) as keyof BusinessHours;
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const todayHours = businessHours[dayOfWeek];

    if (!todayHours || todayHours.closed) {
      return false;
    }

    const { open, close } = todayHours;

    // Handle cases where closing time is past midnight
    if (close < open) {
      return currentTime >= open || currentTime < close;
    }

    return currentTime >= open && currentTime < close;
  }

  async setBusinessHours(businessId: string, hours: BusinessHours) {
    const business = await this.prisma.businessProfile.update({
      where: { userId: businessId },
      data: {
        businessHours: hours as any,
        isOpen: this.isBusinessOpen(hours),
      },
    });

    return business;
  }

  async toggleBusinessOpen(businessId: string, isOpen: boolean) {
    return this.prisma.businessProfile.update({
      where: { userId: businessId },
      data: { isOpen },
    });
  }

  async getBusinessHours(businessId: string) {
    const business = await this.prisma.businessProfile.findUnique({
      where: { userId: businessId },
      select: {
        businessHours: true,
        isOpen: true,
      },
    });

    return {
      hours: business?.businessHours as BusinessHours,
      isOpen: business?.isOpen ?? true,
      currentStatus: business?.businessHours 
        ? this.isBusinessOpen(business.businessHours as any)
        : true,
    };
  }
}
