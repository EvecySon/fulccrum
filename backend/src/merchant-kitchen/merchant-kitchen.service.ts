import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MerchantKitchenService {
  constructor(private readonly prisma: PrismaService) {}

  async getOperations(merchantId: string) {
    const orders = await this.prisma.order.findMany({
      where: { businessId: merchantId, status: { in: ['confirmed', 'preparing'] } },
      orderBy: { createdAt: 'asc' },
      take: 20,
      include: {
        items: { include: { menuItem: { select: { name: true, imageUrl: true } } } },
        customer: { select: { firstName: true, lastName: true } },
      },
    });

    return orders.map((o) => ({
      id: o.id,
      orderId: o.id,
      customerName: `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim(),
      items: o.items?.map((i) => i.menuItem?.name).filter(Boolean) || [],
      status: o.status === 'preparing' ? 'prepping' : 'pending',
      createdAt: o.createdAt,
      estimatedPrepTime: 15,
    }));
  }

  async createOperation(merchantId: string, body: { orderId: string; itemId: string; operationType: string }) {
    if (body.operationType === 'prep_start') {
      await this.prisma.order.update({
        where: { id: body.orderId },
        data: { status: 'preparing' },
      });
    }
    return { message: 'Operation created', ...body };
  }

  async updateOperation(merchantId: string, id: string, data: any) {
    if (data.operationType === 'prep_complete') {
      await this.prisma.order.update({
        where: { id },
        data: { status: 'ready_for_pickup' },
      });
    }
    return { message: 'Operation updated', id, ...data };
  }

  async getInventory(merchantId: string) {
    const items = await this.prisma.menuItem.findMany({
      where: { category: { businessId: merchantId } },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        isAvailable: true,
        stockQuantity: true,
      },
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.imageUrl,
      inStock: item.isAvailable,
      quantity: item.stockQuantity ?? 0,
      lowStockThreshold: 5,
    }));
  }

  async updateInventory(merchantId: string, id: string, data: any) {
    await this.prisma.menuItem.update({
      where: { id },
      data: {
        stockQuantity: data.quantity,
        isAvailable: data.inStock,
      },
    });
    return { message: 'Inventory updated', id };
  }

  async getPrepPredictions(merchantId: string) {
    return {
      peakHours: ['12:00-13:00', '18:00-20:00'],
      predictedOrders: 0,
      suggestedPrepItems: [],
    };
  }
}
