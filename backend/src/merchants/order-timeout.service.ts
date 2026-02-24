import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PushNotificationService } from '../notifications/push-notification.service';

@Injectable()
export class OrderTimeoutService {
  private readonly logger = new Logger(OrderTimeoutService.name);

  constructor(
    private prisma: PrismaService,
    private pushNotificationService: PushNotificationService,
  ) {}

  async scheduleTimeout(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: { include: { user: true } },
        customer: true,
      },
    });

    if (!order) {
      this.logger.error(`Order ${orderId} not found for timeout scheduling`);
      return;
    }

    const timeoutMinutes = order.business.autoAcceptTimeout || 3;

    // Schedule timeout check
    setTimeout(async () => {
      await this.handleTimeout(orderId);
    }, timeoutMinutes * 60 * 1000);

    this.logger.log(`Scheduled timeout for order ${order.orderNumber} in ${timeoutMinutes} minutes`);
  }

  async handleTimeout(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: { include: { user: true } },
        customer: true,
      },
    });

    if (!order) {
      this.logger.error(`Order ${orderId} not found for timeout handling`);
      return;
    }

    // Only handle if still pending
    if (order.status === 'pending') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          timeoutAt: new Date(),
          merchantResponseTime: order.merchantNotifiedAt
            ? Math.floor((Date.now() - order.merchantNotifiedAt.getTime()) / 1000)
            : null,
        },
      });

      // Send urgent notification to merchant
      await this.pushNotificationService.sendToUser({
        userId: order.business.userId,
        title: '⚠️ ORDER TIMEOUT',
        body: `Order #${order.orderNumber} - Customer waiting! Accept now.`,
        data: {
          orderId,
          orderNumber: order.orderNumber,
          type: 'timeout',
          priority: 'high',
        },
      });

      // Notify customer - show merchant phone
      await this.pushNotificationService.sendToUser({
        userId: order.customerId,
        title: 'Merchant Not Responding',
        body: `Please call ${order.business.businessName} directly`,
        data: {
          orderId,
          merchantPhone: order.business.phone,
          merchantName: order.business.businessName,
          type: 'timeout',
        },
      });

      // Log timeout activity
      await this.prisma.merchantActivityLog.create({
        data: {
          merchantId: order.business.userId,
          action: 'order_timeout',
          metadata: {
            orderId,
            orderNumber: order.orderNumber,
            timeoutMinutes: order.business.autoAcceptTimeout || 3,
          },
        },
      });

      this.logger.warn(`Order ${order.orderNumber} timed out - merchant not responding`);
    }
  }

  async notifyMerchant(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: true,
        customer: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) return;

    // Update merchant notified time
    await this.prisma.order.update({
      where: { id: orderId },
      data: { merchantNotifiedAt: new Date() },
    });

    // Send loud push notification
    await this.pushNotificationService.sendToUser({
      userId: order.business.userId,
      title: '🔔 NEW ORDER!',
      body: `Order #${order.orderNumber} - ₦${order.totalAmount} - ${order.items.length} items`,
      data: {
        orderId,
        orderNumber: order.orderNumber,
        type: 'new_order',
        priority: 'high',
      },
    });

    this.logger.log(`Notified merchant for order ${order.orderNumber}`);
  }

  async sendReminderAfterOneMinute(orderId: string) {
    setTimeout(async () => {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { business: true },
      });

      if (order && order.status === 'pending') {
        await this.pushNotificationService.sendToUser({
          userId: order.business.userId,
          title: '⏰ ORDER WAITING!',
          body: `Order #${order.orderNumber} still pending - Customer is waiting`,
          data: {
            orderId,
            orderNumber: order.orderNumber,
            type: 'reminder',
          },
        });

        this.logger.log(`Sent 1-minute reminder for order ${order.orderNumber}`);
      }
    }, 60 * 1000); // 1 minute
  }
}
