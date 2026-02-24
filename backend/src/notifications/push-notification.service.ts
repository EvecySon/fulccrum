import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RegisterTokenDto {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
}

export interface UpdateSettingsDto {
  orderUpdates?: boolean;
  deliveryUpdates?: boolean;
  promotions?: boolean;
  newRestaurants?: boolean;
  driverAssigned?: boolean;
  orderDelivered?: boolean;
  paymentConfirmation?: boolean;
  marketingEmails?: boolean;
  smsNotifications?: boolean;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(private prisma: PrismaService) {}

  async registerPushToken(userId: string, dto: RegisterTokenDto) {
    try {
      const existing = await this.prisma.pushToken.findUnique({
        where: { token: dto.token },
      });

      if (existing) {
        return await this.prisma.pushToken.update({
          where: { token: dto.token },
          data: {
            userId,
            platform: dto.platform,
            deviceId: dto.deviceId,
            isActive: true,
            lastUsed: new Date(),
          },
        });
      }

      return await this.prisma.pushToken.create({
        data: {
          userId,
          token: dto.token,
          platform: dto.platform,
          deviceId: dto.deviceId,
          isActive: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to register push token: ${error.message}`);
      throw error;
    }
  }

  async removePushToken(token: string) {
    return await this.prisma.pushToken.update({
      where: { token },
      data: { isActive: false },
    });
  }

  async getUserPushTokens(userId: string) {
    return await this.prisma.pushToken.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  async getNotificationSettings(userId: string) {
    let settings = await this.prisma.notificationSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.notificationSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateNotificationSettings(userId: string, dto: UpdateSettingsDto) {
    const existing = await this.prisma.notificationSettings.findUnique({
      where: { userId },
    });

    if (existing) {
      return await this.prisma.notificationSettings.update({
        where: { userId },
        data: dto,
      });
    }

    return await this.prisma.notificationSettings.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async checkUserPreference(userId: string, preferenceKey: string): Promise<boolean> {
    const settings = await this.getNotificationSettings(userId);
    return settings[preferenceKey] ?? true;
  }

  async deactivateInvalidTokens(tokens: string[]) {
    await this.prisma.pushToken.updateMany({
      where: { token: { in: tokens } },
      data: { isActive: false },
    });
  }

  async updateTokenLastUsed(token: string) {
    await this.prisma.pushToken.update({
      where: { token },
      data: { lastUsed: new Date() },
    });
  }

  async getUsersWithPushEnabled(userIds: string[]): Promise<string[]> {
    const tokens = await this.prisma.pushToken.findMany({
      where: {
        userId: { in: userIds },
        isActive: true,
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    return tokens.map(t => t.userId);
  }

  async cleanupOldTokens(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.pushToken.deleteMany({
      where: {
        lastUsed: { lt: cutoffDate },
        isActive: false,
      },
    });

    this.logger.log(`Cleaned up ${result.count} old push tokens`);
    return result;
  }
}
