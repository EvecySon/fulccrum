import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StoreStatusResponse {
  status: 'open_active' | 'open_busy' | 'open_unverified' | 'closed' | 'paused';
  reliability: 'high' | 'medium' | 'low';
  message: string;
  showPhone: boolean;
  phone?: string;
  lastSeen?: Date;
  resumesAt?: Date;
}

@Injectable()
export class MerchantStatusService {
  constructor(private prisma: PrismaService) {}

  async updateLastSeen(merchantId: string, metadata?: any) {
    await this.prisma.businessProfile.update({
      where: { userId: merchantId },
      data: { lastSeenAt: new Date() },
    });

    await this.prisma.merchantActivityLog.create({
      data: {
        merchantId,
        action: 'app_opened',
        metadata,
        timestamp: new Date(),
      },
    });
  }

  async setManualStatus(
    merchantId: string,
    status: 'auto' | 'force_open' | 'force_closed' | 'paused',
    pauseMinutes?: number,
    reason?: string,
  ) {
    const data: any = { manualStatus: status };

    if (status === 'paused' && pauseMinutes) {
      data.pausedUntil = new Date(Date.now() + pauseMinutes * 60000);
      data.pauseReason = reason;
    } else if (status !== 'paused') {
      data.pausedUntil = null;
      data.pauseReason = null;
    }

    const result = await this.prisma.businessProfile.update({
      where: { userId: merchantId },
      data,
    });

    await this.prisma.merchantActivityLog.create({
      data: {
        merchantId,
        action: 'status_changed',
        metadata: { status, pauseMinutes, reason },
        timestamp: new Date(),
      },
    });

    return result;
  }

  async getStoreStatus(merchantId: string): Promise<StoreStatusResponse> {
    const merchant = await this.prisma.businessProfile.findUnique({
      where: { userId: merchantId },
      include: { businessHours: true },
    });

    if (!merchant) {
      return {
        status: 'closed',
        reliability: 'high',
        message: 'Store not found',
        showPhone: false,
      };
    }

    const now = new Date();
    const isWithinBusinessHours = this.checkBusinessHours(now, merchant.businessHours);

    let baseStatus = isWithinBusinessHours ? 'open' : 'closed';

    // Check manual override
    if (merchant.manualStatus === 'force_closed') {
      baseStatus = 'closed';
    } else if (merchant.manualStatus === 'force_open') {
      baseStatus = 'open';
    } else if (merchant.manualStatus === 'paused') {
      if (merchant.pausedUntil && merchant.pausedUntil > now) {
        return {
          status: 'paused',
          reliability: 'high',
          message: merchant.pauseReason || 'Temporarily unavailable',
          resumesAt: merchant.pausedUntil,
          showPhone: merchant.showPhoneToCustomers,
          phone: merchant.showPhoneToCustomers ? merchant.phone : undefined,
        };
      } else {
        // Auto-resume
        await this.setManualStatus(merchantId, 'auto');
        baseStatus = isWithinBusinessHours ? 'open' : 'closed';
      }
    }

    // Check activity
    if (baseStatus === 'open' && merchant.lastSeenAt) {
      const hoursSinceLastSeen = (now.getTime() - merchant.lastSeenAt.getTime()) / (1000 * 60 * 60);
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const wasActiveToday = merchant.lastSeenAt > todayStart;

      if (!wasActiveToday) {
        return {
          status: 'open_unverified',
          reliability: 'low',
          message: 'Store has not opened today. Call to confirm availability.',
          showPhone: merchant.showPhoneToCustomers,
          phone: merchant.showPhoneToCustomers ? merchant.phone : undefined,
          lastSeen: merchant.lastSeenAt,
        };
      } else if (hoursSinceLastSeen > 12) {
        return {
          status: 'open_unverified',
          reliability: 'low',
          message: 'Store may have closed early. Call to confirm.',
          showPhone: merchant.showPhoneToCustomers,
          phone: merchant.showPhoneToCustomers ? merchant.phone : undefined,
          lastSeen: merchant.lastSeenAt,
        };
      } else if (hoursSinceLastSeen > 6) {
        return {
          status: 'open_busy',
          reliability: 'medium',
          message: 'Store may be busy with customers. Response time may be longer.',
          showPhone: merchant.showPhoneToCustomers,
          phone: merchant.showPhoneToCustomers ? merchant.phone : undefined,
          lastSeen: merchant.lastSeenAt,
        };
      } else {
        return {
          status: 'open_active',
          reliability: 'high',
          message: 'Store is accepting orders',
          showPhone: false,
          lastSeen: merchant.lastSeenAt,
        };
      }
    }

    return {
      status: 'closed',
      reliability: 'high',
      message: 'Store is currently closed',
      showPhone: false,
    };
  }

  private checkBusinessHours(now: Date, businessHours: any[]): boolean {
    if (!businessHours || businessHours.length === 0) return true;

    const dayOfWeek = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = businessHours.find((h) => h.dayOfWeek === dayOfWeek);
    if (!todayHours || !todayHours.isOpen) return false;

    const openTime = this.timeToMinutes(todayHours.openTime);
    const closeTime = this.timeToMinutes(todayHours.closeTime);

    return currentTime >= openTime && currentTime <= closeTime;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async logActivity(merchantId: string, action: string, metadata?: any) {
    await this.prisma.merchantActivityLog.create({
      data: {
        merchantId,
        action,
        metadata,
        timestamp: new Date(),
      },
    });
  }
}
