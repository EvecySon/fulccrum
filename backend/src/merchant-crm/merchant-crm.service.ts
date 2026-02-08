import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MerchantCrmService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomerProfiles(merchantId: string, page: number) {
    const take = 20;
    const skip = (page - 1) * take;

    const orders = await this.prisma.order.findMany({
      where: { businessId: merchantId },
      select: { customerId: true },
      distinct: ['customerId'],
      skip,
      take,
    });

    const customerIds = orders.map((o) => o.customerId);

    const customers = await this.prisma.user.findMany({
      where: { id: { in: customerIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return { data: customers, page, hasMore: customers.length === take };
  }

  async getCustomerProfile(merchantId: string, customerId: string) {
    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const orderCount = await this.prisma.order.count({
      where: { businessId: merchantId, customerId },
    });

    return { ...customer, totalOrders: orderCount };
  }

  async getCampaigns(merchantId: string) {
    return [];
  }

  async createCampaign(merchantId: string, data: any) {
    return { id: `campaign-${Date.now()}`, ...data, merchantId, createdAt: new Date() };
  }

  async updateCampaign(merchantId: string, id: string, data: any) {
    return { message: 'Campaign updated', id, ...data };
  }

  async deleteCampaign(merchantId: string, id: string) {
    return { message: 'Campaign deleted', id };
  }

  async getLoyaltyProgram(merchantId: string) {
    return {
      merchantId,
      enabled: false,
      pointsPerOrder: 10,
      rewardThreshold: 100,
      rewardValue: 500,
    };
  }

  async updateLoyaltyProgram(merchantId: string, data: any) {
    return { message: 'Loyalty program updated', ...data };
  }
}
