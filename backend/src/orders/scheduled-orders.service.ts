import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class ScheduledOrdersService {
  private readonly logger = new Logger(ScheduledOrdersService.name);

  constructor(
    private prisma: PrismaService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledOrders() {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    try {
      // Find scheduled orders that should be activated soon
      const ordersToActivate = await this.prisma.order.findMany({
        where: {
          status: 'scheduled',
          scheduledFor: {
            lte: fiveMinutesFromNow,
            gte: now,
          },
        },
        include: {
          business: {
            select: {
              businessName: true,
              userId: true,
            },
          },
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      for (const order of ordersToActivate) {
        // Update order status to pending
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'pending' },
        });

        // Notify merchant via WebSocket
        this.realtimeGateway.emitNewOrderToMerchant(order.businessId, order);

        this.logger.log(
          `Activated scheduled order ${order.orderNumber} for ${order.business.businessName}`,
        );
      }

      if (ordersToActivate.length > 0) {
        this.logger.log(`Processed ${ordersToActivate.length} scheduled orders`);
      }
    } catch (error) {
      this.logger.error('Error processing scheduled orders:', error);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkExpiredScheduledOrders() {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    try {
      // Find scheduled orders that are past their scheduled time by more than 2 hours
      const expiredOrders = await this.prisma.order.findMany({
        where: {
          status: 'scheduled',
          scheduledFor: {
            lt: twoHoursAgo,
          },
        },
      });

      for (const order of expiredOrders) {
        // Auto-cancel expired scheduled orders
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'cancelled',
          },
        });

        this.logger.warn(
          `Auto-cancelled expired scheduled order ${order.orderNumber}`,
        );
      }

      if (expiredOrders.length > 0) {
        this.logger.log(`Cancelled ${expiredOrders.length} expired scheduled orders`);
      }
    } catch (error) {
      this.logger.error('Error checking expired scheduled orders:', error);
    }
  }

  async getUpcomingScheduledOrders(businessId: string) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.prisma.order.findMany({
      where: {
        businessId,
        status: 'scheduled',
        scheduledFor: {
          gte: now,
          lte: tomorrow,
        },
      },
      orderBy: { scheduledFor: 'asc' },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
