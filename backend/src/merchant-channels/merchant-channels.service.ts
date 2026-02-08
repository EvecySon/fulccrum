import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MerchantChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  async getChannels(merchantId: string) {
    return [
      { id: 'dine-in', name: 'Dine-In', enabled: false, orders: 0 },
      { id: 'pickup', name: 'Pickup', enabled: true, orders: 0 },
      { id: 'delivery', name: 'Delivery', enabled: true, orders: 0 },
      { id: 'catering', name: 'Catering', enabled: false, orders: 0 },
    ];
  }

  async updateChannel(merchantId: string, id: string, data: any) {
    return { message: 'Channel updated', id, ...data };
  }

  async getSubscriptions(merchantId: string) {
    return [];
  }

  async createSubscription(merchantId: string, data: any) {
    return { id: `sub-${Date.now()}`, ...data, merchantId, createdAt: new Date() };
  }

  async updateSubscription(merchantId: string, id: string, data: any) {
    return { message: 'Subscription updated', id, ...data };
  }

  async deleteSubscription(merchantId: string, id: string) {
    return { message: 'Subscription deleted', id };
  }

  async getCatering(merchantId: string) {
    return [];
  }

  async createCateringOrder(merchantId: string, data: any) {
    return { id: `catering-${Date.now()}`, ...data, merchantId, createdAt: new Date() };
  }
}
