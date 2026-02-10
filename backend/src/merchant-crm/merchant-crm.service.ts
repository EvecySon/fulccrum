import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MerchantCrmService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Customers ───

  async getCustomerProfiles(merchantId: string, page: number) {
    const take = 20;
    const skip = (page - 1) * take;

    // Get customers who ordered from this merchant
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

    // Also include manually added CRM customers
    const crmCustomers = await this.prisma.crmCustomerNote.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const combined = [
      ...customers.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        avatar: c.avatarUrl || '',
        totalOrders: 0,
        totalSpent: 0,
        favoriteItems: [],
        frequency: 'Regular',
        loyaltyScore: 50,
        lastVisit: c.createdAt.toISOString().split('T')[0],
        source: 'order',
      })),
      ...crmCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        avatar: '',
        totalOrders: 0,
        totalSpent: 0,
        favoriteItems: [],
        frequency: 'New',
        loyaltyScore: 0,
        lastVisit: c.createdAt.toISOString().split('T')[0],
        email: c.email,
        phone: c.phone,
        source: 'manual',
      })),
    ];

    return { data: combined, page, hasMore: combined.length === take };
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

  async createCustomerNote(merchantId: string, data: any) {
    const note = await this.prisma.crmCustomerNote.create({
      data: {
        merchantId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        notes: data.notes || null,
      },
    });
    return {
      id: note.id,
      name: note.name,
      avatar: '',
      totalOrders: 0,
      totalSpent: 0,
      favoriteItems: [],
      frequency: 'New',
      loyaltyScore: 0,
      lastVisit: 'Just now',
      email: note.email,
      phone: note.phone,
    };
  }

  // ─── Campaigns ───

  async getCampaigns(merchantId: string) {
    const campaigns = await this.prisma.crmCampaign.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
    return {
      data: campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        targetCount: c.targetCount,
        status: c.status,
        effectiveness: c.effectiveness,
      })),
    };
  }

  async createCampaign(merchantId: string, data: any) {
    const campaign = await this.prisma.crmCampaign.create({
      data: {
        merchantId,
        name: data.name,
        type: data.type || 'promotion',
        targetCount: data.targetCount || 0,
        status: 'draft',
      },
    });
    return {
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      targetCount: campaign.targetCount,
      status: campaign.status,
      effectiveness: campaign.effectiveness,
    };
  }

  async updateCampaign(merchantId: string, id: string, data: any) {
    const campaign = await this.prisma.crmCampaign.updateMany({
      where: { id, merchantId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.targetCount !== undefined && { targetCount: data.targetCount }),
        ...(data.status && { status: data.status }),
      },
    });
    if (campaign.count === 0) throw new NotFoundException('Campaign not found');
    return { message: 'Campaign updated', id };
  }

  async deleteCampaign(merchantId: string, id: string) {
    const result = await this.prisma.crmCampaign.deleteMany({
      where: { id, merchantId },
    });
    if (result.count === 0) throw new NotFoundException('Campaign not found');
    return { message: 'Campaign deleted', id };
  }

  // ─── Loyalty ───

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
