import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(userId: string, dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: dto.type as any,
        title: dto.title,
        message: dto.message,
        data: dto.data || {},
      },
    });

    // Send push notification if user has device tokens
    await this.sendPushNotification(userId, dto.title, dto.message, dto.data);

    return notification;
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    const deviceTokens = await this.prisma.deviceToken.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    if (deviceTokens.length === 0) {
      console.log(`[PUSH] No active devices for user ${userId}`);
      return;
    }

    // TODO: Integrate with Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNS)
    // For now, we'll log the notification
    console.log(`[PUSH] Sending to ${deviceTokens.length} device(s) for user ${userId}`);
    console.log(`[PUSH] Title: ${title}`);
    console.log(`[PUSH] Body: ${body}`);
    console.log(`[PUSH] Data:`, data);

    // Example FCM integration (commented out - requires firebase-admin):
    /*
    const admin = require('firebase-admin');
    const tokens = deviceTokens.map(dt => dt.token);
    
    const message = {
      notification: { title, body },
      data: data || {},
      tokens,
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log(`[PUSH] Successfully sent: ${response.successCount}`);
      console.log(`[PUSH] Failed: ${response.failureCount}`);
      
      // Deactivate invalid tokens
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/invalid-registration-token') {
          this.deactivateDeviceToken(tokens[idx]);
        }
      });
    } catch (error) {
      console.error('[PUSH] Error sending notification:', error);
    }
    */

    return {
      sent: true,
      deviceCount: deviceTokens.length,
    };
  }

  async sendEmail(userId: string, subject: string, body: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: Integrate with SendGrid, AWS SES, or similar
    console.log(`[EMAIL] Sending to ${user.email}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${body}`);

    // Example SendGrid integration (commented out - requires @sendgrid/mail):
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject,
      text: body,
      html: `<p>Hi ${user.firstName},</p><p>${body}</p>`,
    };

    try {
      await sgMail.send(msg);
      console.log('[EMAIL] Sent successfully');
    } catch (error) {
      console.error('[EMAIL] Error:', error);
    }
    */

    return { sent: true, email: user.email };
  }

  async sendSMS(userId: string, message: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });

    if (!user || !user.phone) {
      throw new NotFoundException('User phone not found');
    }

    // TODO: Integrate with Twilio or similar
    console.log(`[SMS] Sending to ${user.phone}`);
    console.log(`[SMS] Message: ${message}`);

    // Example Twilio integration (commented out - requires twilio):
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phone,
      });
      console.log('[SMS] Sent successfully:', result.sid);
    } catch (error) {
      console.error('[SMS] Error:', error);
    }
    */

    return { sent: true, phone: user.phone };
  }

  async getUserNotifications(userId: string, unreadOnly = false, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where: any = { userId };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return {
      success: true,
      markedCount: result.count,
    };
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }

  async registerDeviceToken(userId: string, token: string, platform: string, deviceId?: string) {
    // Check if token already exists
    const existing = await this.prisma.deviceToken.findUnique({
      where: { token },
    });

    if (existing) {
      // Update existing token
      return this.prisma.deviceToken.update({
        where: { token },
        data: {
          userId,
          platform,
          deviceId,
          isActive: true,
          updatedAt: new Date(),
        },
      });
    }

    // Create new token
    return this.prisma.deviceToken.create({
      data: {
        userId,
        token,
        platform,
        deviceId,
        isActive: true,
      },
    });
  }

  async deactivateDeviceToken(token: string) {
    return this.prisma.deviceToken.updateMany({
      where: { token },
      data: { isActive: false },
    });
  }

  async getUserDevices(userId: string) {
    return this.prisma.deviceToken.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        platform: true,
        deviceId: true,
        createdAt: true,
      },
    });
  }

  async removeDevice(userId: string, deviceId: string) {
    const result = await this.prisma.deviceToken.deleteMany({
      where: {
        userId,
        id: deviceId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Device not found');
    }

    return { success: true };
  }

  // Helper methods for common notification scenarios
  async notifyOrderUpdate(userId: string, orderId: string, status: string, orderNumber: string) {
    const statusMessages: Record<string, string> = {
      accepted: 'Your order has been accepted!',
      preparing: 'Your order is being prepared',
      ready: 'Your order is ready for pickup',
      picked_up: 'Your order has been picked up by the driver',
      in_transit: 'Your order is on the way',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    };

    const message = statusMessages[status] || 'Your order status has been updated';

    return this.createNotification(userId, {
      type: 'order_update',
      title: `Order ${orderNumber}`,
      message,
      data: { orderId, status },
    });
  }

  async notifyWithdrawalUpdate(userId: string, amount: number, status: string) {
    const statusMessages: Record<string, string> = {
      confirmed: `Your withdrawal of $${amount} has been confirmed`,
      processing: `Your withdrawal of $${amount} is being processed`,
      completed: `Your withdrawal of $${amount} has been completed`,
      failed: `Your withdrawal of $${amount} has failed`,
    };

    const message = statusMessages[status] || 'Withdrawal status updated';

    return this.createNotification(userId, {
      type: 'payment_update',
      title: 'Withdrawal Update',
      message,
      data: { amount, status },
    });
  }

  async notifyNewMessage(userId: string, from: string, preview: string) {
    return this.createNotification(userId, {
      type: 'support_message',
      title: `New message from ${from}`,
      message: preview,
      data: { from },
    });
  }
}
