import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushSuccessTicket } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

@Injectable()
export class ExpoPushService {
  private readonly logger = new Logger(ExpoPushService.name);
  private expo: Expo;

  constructor(private prisma: PrismaService) {
    this.expo = new Expo();
  }

  async sendToUser(userId: string, notification: PushNotificationPayload) {
    try {
      // Get all active push tokens for this user
      const tokens = await this.prisma.pushToken.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      if (tokens.length === 0) {
        this.logger.warn(`No active push tokens found for user ${userId}`);
        return { success: false, reason: 'no_tokens' };
      }

      // Filter valid Expo push tokens
      const validTokens = tokens
        .map((t) => t.token)
        .filter((token) => Expo.isExpoPushToken(token));

      if (validTokens.length === 0) {
        this.logger.warn(`No valid Expo push tokens for user ${userId}`);
        return { success: false, reason: 'invalid_tokens' };
      }

      // Send to all user's devices
      const result = await this.sendToTokens(validTokens, notification);

      this.logger.log(`Sent notification to user ${userId}: ${result.successCount}/${validTokens.length} succeeded`);

      return result;
    } catch (error) {
      this.logger.error(`Error sending notification to user ${userId}:`, error);
      throw error;
    }
  }

  async sendToTokens(tokens: string[], notification: PushNotificationPayload) {
    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      sound: notification.sound ?? 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      priority: notification.priority || 'high',
      badge: notification.badge,
      channelId: notification.channelId || 'default',
    }));

    // Chunk messages for batch sending
    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        this.logger.error('Error sending push notification chunk:', error);
      }
    }

    // Process tickets and handle errors
    const successCount = tickets.filter((ticket) => ticket.status === 'ok').length;
    const errorCount = tickets.filter((ticket) => ticket.status === 'error').length;

    // Deactivate invalid tokens
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      if (ticket.status === 'error') {
        const token = tokens[i];
        const error = (ticket as any).details?.error;

        // Deactivate token if it's invalid
        if (error === 'DeviceNotRegistered' || error === 'InvalidCredentials') {
          await this.deactivateToken(token);
          this.logger.warn(`Deactivated invalid token: ${token}`);
        }
      }
    }

    return {
      success: successCount > 0,
      successCount,
      errorCount,
      tickets,
    };
  }

  async sendToMultipleUsers(userIds: string[], notification: PushNotificationPayload) {
    const results = await Promise.allSettled(
      userIds.map((userId) => this.sendToUser(userId, notification)),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    this.logger.log(`Sent to ${successful}/${userIds.length} users (${failed} failed)`);

    return {
      total: userIds.length,
      successful,
      failed,
      results,
    };
  }

  async sendWithTemplate(
    userId: string,
    templateId: string,
    variables: Record<string, string>,
  ) {
    try {
      // Get notification template
      const template = await this.prisma.notificationTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template || !template.isActive) {
        this.logger.warn(`Template ${templateId} not found or inactive`);
        return { success: false, reason: 'template_not_found' };
      }

      // Replace variables in title and body
      let title = template.title;
      let body = template.body;

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        title = title.replace(new RegExp(placeholder, 'g'), value);
        body = body.replace(new RegExp(placeholder, 'g'), value);
      });

      // Send notification
      const result = await this.sendToUser(userId, {
        title,
        body,
        data: { templateId, ...template.data },
        priority: 'high',
      });

      // Log notification
      await this.prisma.notificationLog.create({
        data: {
          templateId,
          userId,
          title,
          body,
          data: { variables, ...template.data },
          status: result.success ? 'sent' : 'failed',
          platform: 'expo',
        },
      });

      return result;
    } catch (error) {
      this.logger.error(`Error sending templated notification:`, error);
      throw error;
    }
  }

  private async deactivateToken(token: string) {
    try {
      await this.prisma.pushToken.updateMany({
        where: { token },
        data: { isActive: false },
      });
    } catch (error) {
      this.logger.error(`Error deactivating token ${token}:`, error);
    }
  }

  async checkReceiptStatus(ticketIds: string[]) {
    try {
      const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(ticketIds);
      const receipts = [];

      for (const chunk of receiptIdChunks) {
        const receiptChunk = await this.expo.getPushNotificationReceiptsAsync(chunk);
        receipts.push(receiptChunk);
      }

      return receipts;
    } catch (error) {
      this.logger.error('Error checking receipt status:', error);
      throw error;
    }
  }
}
