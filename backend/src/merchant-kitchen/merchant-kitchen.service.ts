import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MerchantKitchenService {
  constructor(private readonly prisma: PrismaService) {}

  async getOperations(merchantId: string) {
    const orders = await this.prisma.order.findMany({
      where: { businessId: merchantId, status: { in: ['accepted', 'preparing'] } },
      orderBy: { createdAt: 'asc' },
      take: 20,
      include: {
        items: { include: { menuItem: { select: { name: true, images: true } } } },
        customer: { select: { firstName: true, lastName: true } },
      },
    });

    // Get merchant's average prep time
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId: merchantId },
      select: { averagePreparationTime: true },
    });
    const basePrepTime = profile?.averagePreparationTime || 15;

    return orders.map((o: any) => {
      const itemCount = o.items?.length || 1;
      const estimatedPrepTime = Math.round(basePrepTime * (1 + (itemCount - 1) * 0.3));
      return {
        id: o.id,
        orderId: o.id,
        customerName: `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim(),
        items: o.items?.map((i: any) => i.menuItem?.name).filter(Boolean) || [],
        status: o.status === 'preparing' ? 'prepping' : 'pending',
        createdAt: o.createdAt,
        estimatedPrepTime,
      };
    });
  }

  async createOperation(merchantId: string, body: { orderId: string; itemId: string; operationType: string; stationId?: string }) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId: merchantId },
      select: { averagePreparationTime: true },
    });

    const op = await this.prisma.kitchenOperation.create({
      data: {
        businessId: merchantId,
        orderId: body.orderId,
        itemId: body.itemId || null,
        operationType: body.operationType,
        stationId: body.stationId || null,
        estimatedPrepTime: profile?.averagePreparationTime || 15,
        status: body.operationType === 'prep_start' ? 'in_progress' : 'pending',
        startedAt: body.operationType === 'prep_start' ? new Date() : null,
      },
    });

    if (body.operationType === 'prep_start') {
      await this.prisma.order.update({
        where: { id: body.orderId },
        data: { status: 'preparing' },
      });
    }
    return op;
  }

  async updateOperation(merchantId: string, id: string, data: any) {
    const existing = await this.prisma.kitchenOperation.findFirst({
      where: { id, businessId: merchantId },
    });

    const now = new Date();
    const actualPrepTime = existing?.startedAt
      ? Math.round((now.getTime() - existing.startedAt.getTime()) / 60000)
      : null;

    const op = await this.prisma.kitchenOperation.update({
      where: { id },
      data: {
        ...(data.operationType === 'prep_complete' && {
          status: 'completed',
          completedAt: now,
          actualPrepTime,
        }),
        ...(data.operationType === 'prep_start' && {
          status: 'in_progress',
          startedAt: now,
        }),
        ...(data.stationId && { stationId: data.stationId }),
      },
    });

    if (data.operationType === 'prep_complete' && existing) {
      await this.prisma.order.update({
        where: { id: existing.orderId },
        data: { status: 'ready' },
      });
    }
    return op;
  }

  async getInventory(merchantId: string) {
    const items = await this.prisma.menuItem.findMany({
      where: { category: { businessId: merchantId } },
      select: {
        id: true,
        name: true,
        images: true,
        isAvailable: true,
      },
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      image: Array.isArray(item.images) ? (item.images as any)[0] || '' : '',
      inStock: item.isAvailable,
      quantity: 0,
      lowStockThreshold: 5,
    }));
  }

  async updateInventory(merchantId: string, id: string, data: any) {
    await this.prisma.menuItem.update({
      where: { id },
      data: {
        isAvailable: data.inStock,
      },
    });
    return { message: 'Inventory updated', id };
  }

  async getPrepPredictions(merchantId: string) {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const orders = await this.prisma.order.findMany({
      where: { businessId: merchantId, createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    });

    // Calculate peak hours from last week's orders
    const hourCounts: Record<number, number> = {};
    orders.forEach((o) => {
      const h = o.createdAt.getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });

    const sorted = Object.entries(hourCounts)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 3);

    const peakHours = sorted.map(([h]) => {
      const hour = parseInt(h);
      return `${String(hour).padStart(2, '0')}:00-${String(hour + 1).padStart(2, '0')}:00`;
    });

    // Predict today's orders based on weekly average
    const avgDaily = orders.length > 0 ? Math.round(orders.length / 7) : 0;

    // Get most ordered items
    const recentOrders = await this.prisma.order.findMany({
      where: { businessId: merchantId, createdAt: { gte: weekAgo } },
      include: { items: { include: { menuItem: { select: { name: true } } } } },
      take: 50,
    });

    const itemCounts: Record<string, number> = {};
    recentOrders.forEach((o: any) => {
      (o.items || []).forEach((i: any) => {
        const name = i.menuItem?.name;
        if (name) itemCounts[name] = (itemCounts[name] || 0) + i.quantity;
      });
    });

    const suggestedPrepItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, estimatedQuantity: Math.ceil(count / 7) }));

    return {
      peakHours: peakHours.length > 0 ? peakHours : ['12:00-13:00', '18:00-20:00'],
      predictedOrders: avgDaily,
      suggestedPrepItems,
    };
  }
}
