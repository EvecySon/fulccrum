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

    // Aggregate order stats per customer
    const orderStats = customerIds.length > 0
      ? await this.prisma.order.groupBy({
          by: ['customerId'],
          where: { businessId: merchantId, customerId: { in: customerIds } },
          _count: true,
          _sum: { totalAmount: true },
        })
      : [];

    const statsMap: Record<string, { count: number; spent: number }> = {};
    orderStats.forEach((s: any) => {
      statsMap[s.customerId] = {
        count: s._count,
        spent: Number(s._sum?.totalAmount || 0),
      };
    });

    // Get last order date per customer
    const lastOrders = customerIds.length > 0
      ? await this.prisma.order.findMany({
          where: { businessId: merchantId, customerId: { in: customerIds } },
          orderBy: { createdAt: 'desc' },
          distinct: ['customerId'],
          select: { customerId: true, createdAt: true },
        })
      : [];

    const lastOrderMap: Record<string, Date> = {};
    lastOrders.forEach((o: any) => { lastOrderMap[o.customerId] = o.createdAt; });

    // Get favorite items per customer from order items
    const favoriteItemsMap: Record<string, string[]> = {};
    if (customerIds.length > 0) {
      const orderItems = await this.prisma.order.findMany({
        where: { businessId: merchantId, customerId: { in: customerIds } },
        select: { customerId: true, items: { select: { menuItem: { select: { name: true } } }, take: 10 } },
        take: 100,
      });
      orderItems.forEach((o: any) => {
        if (!favoriteItemsMap[o.customerId]) favoriteItemsMap[o.customerId] = [];
        (o.items || []).forEach((i: any) => {
          if (i.menuItem?.name && !favoriteItemsMap[o.customerId].includes(i.menuItem.name)) {
            favoriteItemsMap[o.customerId].push(i.menuItem.name);
          }
        });
      });
      // Keep top 5 per customer
      Object.keys(favoriteItemsMap).forEach((k) => { favoriteItemsMap[k] = favoriteItemsMap[k].slice(0, 5); });
    }

    // Upsert into MerchantCustomerProfile for persistence
    for (const c of customers) {
      const st = statsMap[c.id] || { count: 0, spent: 0 };
      const freq = st.count >= 10 ? 'VIP' : st.count >= 5 ? 'Regular' : st.count >= 2 ? 'Returning' : 'New';
      await this.prisma.merchantCustomerProfile.upsert({
        where: { businessId_customerId: { businessId: merchantId, customerId: c.id } },
        create: {
          businessId: merchantId,
          customerId: c.id,
          totalOrders: st.count,
          totalSpent: st.spent,
          favoriteItems: favoriteItemsMap[c.id] || [],
          orderFrequency: freq,
          loyaltyScore: Math.min(100, st.count * 10),
          lastVisit: lastOrderMap[c.id] || c.createdAt,
        },
        update: {
          totalOrders: st.count,
          totalSpent: st.spent,
          favoriteItems: favoriteItemsMap[c.id] || [],
          orderFrequency: freq,
          loyaltyScore: Math.min(100, st.count * 10),
          lastVisit: lastOrderMap[c.id] || undefined,
        },
      });
    }

    const combined = [
      ...customers.map((c) => {
        const st = statsMap[c.id] || { count: 0, spent: 0 };
        const freq = st.count >= 10 ? 'VIP' : st.count >= 5 ? 'Regular' : st.count >= 2 ? 'Returning' : 'New';
        const loyaltyScore = Math.min(100, st.count * 10);
        return {
          id: c.id,
          name: `${c.firstName} ${c.lastName}`.trim(),
          avatar: c.avatarUrl || '',
          totalOrders: st.count,
          totalSpent: Math.round(st.spent * 100) / 100,
          favoriteItems: favoriteItemsMap[c.id] || [],
          frequency: freq,
          loyaltyScore,
          lastVisit: lastOrderMap[c.id]
            ? lastOrderMap[c.id].toISOString().split('T')[0]
            : c.createdAt.toISOString().split('T')[0],
          source: 'order',
        };
      }),
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
    let program = await this.prisma.loyaltyProgram.findUnique({
      where: { merchantId },
    });

    if (!program) {
      program = await this.prisma.loyaltyProgram.create({
        data: { merchantId },
      });
    }

    return program;
  }

  async updateLoyaltyProgram(merchantId: string, data: any) {
    const program = await this.prisma.loyaltyProgram.upsert({
      where: { merchantId },
      create: {
        merchantId,
        ...(data.enabled !== undefined && { enabled: data.enabled }),
        ...(data.pointsPerOrder !== undefined && { pointsPerOrder: parseInt(data.pointsPerOrder) }),
        ...(data.rewardThreshold !== undefined && { rewardThreshold: parseInt(data.rewardThreshold) }),
        ...(data.rewardValue !== undefined && { rewardValue: parseInt(data.rewardValue) }),
        ...(data.rewardType && { rewardType: data.rewardType }),
      },
      update: {
        ...(data.enabled !== undefined && { enabled: data.enabled }),
        ...(data.pointsPerOrder !== undefined && { pointsPerOrder: parseInt(data.pointsPerOrder) }),
        ...(data.rewardThreshold !== undefined && { rewardThreshold: parseInt(data.rewardThreshold) }),
        ...(data.rewardValue !== undefined && { rewardValue: parseInt(data.rewardValue) }),
        ...(data.rewardType && { rewardType: data.rewardType }),
      },
    });
    return program;
  }
}
