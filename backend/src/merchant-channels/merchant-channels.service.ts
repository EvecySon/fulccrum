import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_CHANNELS = [
  { type: 'dine-in', name: 'Dine-In' },
  { type: 'pickup', name: 'Pickup' },
  { type: 'delivery', name: 'Delivery' },
  { type: 'catering', name: 'Catering' },
];

@Injectable()
export class MerchantChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  async getChannels(merchantId: string) {
    let channels = await this.prisma.merchantChannel.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'asc' },
    });

    // Seed default channels if none exist
    if (channels.length === 0) {
      await this.prisma.merchantChannel.createMany({
        data: DEFAULT_CHANNELS.map((ch) => ({
          merchantId,
          name: ch.name,
          type: ch.type,
          enabled: ch.type === 'delivery' || ch.type === 'pickup',
        })),
        skipDuplicates: true,
      });
      channels = await this.prisma.merchantChannel.findMany({
        where: { merchantId },
        orderBy: { createdAt: 'asc' },
      });
    }

    return channels;
  }

  async updateChannel(merchantId: string, id: string, data: any) {
    const result = await this.prisma.merchantChannel.updateMany({
      where: { id, merchantId },
      data: {
        ...(data.enabled !== undefined && { enabled: data.enabled }),
        ...(data.name && { name: data.name }),
      },
    });
    if (result.count === 0) throw new NotFoundException('Channel not found');
    return { message: 'Channel updated', id };
  }

  async getSubscriptions(merchantId: string) {
    return this.prisma.merchantSubscription.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSubscription(merchantId: string, data: any) {
    return this.prisma.merchantSubscription.create({
      data: {
        merchantId,
        name: data.name,
        type: data.type || 'meal_plan',
        price: parseFloat(data.price) || 0,
        schedule: data.schedule || 'weekly',
      },
    });
  }

  async updateSubscription(merchantId: string, id: string, data: any) {
    const result = await this.prisma.merchantSubscription.updateMany({
      where: { id, merchantId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.price !== undefined && { price: parseFloat(data.price) }),
        ...(data.schedule && { schedule: data.schedule }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    if (result.count === 0) throw new NotFoundException('Subscription not found');
    return { message: 'Subscription updated', id };
  }

  async deleteSubscription(merchantId: string, id: string) {
    const result = await this.prisma.merchantSubscription.deleteMany({
      where: { id, merchantId },
    });
    if (result.count === 0) throw new NotFoundException('Subscription not found');
    return { message: 'Subscription deleted', id };
  }

  async getCatering(merchantId: string) {
    return this.prisma.order.findMany({
      where: { businessId: merchantId, specialInstructions: { contains: 'catering' } },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCateringOrder(merchantId: string, data: any) {
    return { id: `catering-${Date.now()}`, ...data, merchantId, createdAt: new Date() };
  }
}
