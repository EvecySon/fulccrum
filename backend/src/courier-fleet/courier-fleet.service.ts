import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourierFleetService {
  constructor(private readonly prisma: PrismaService) {}

  async getPerformance(courierId: string) {
    const totalDeliveries = await this.prisma.order.count({
      where: { driverId: courierId, status: 'delivered' },
    });

    const recentOrders = await this.prisma.order.findMany({
      where: { driverId: courierId, status: 'delivered' },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: { createdAt: true, updatedAt: true },
    });

    const avgDeliveryTime = recentOrders.length > 0
      ? recentOrders.reduce((sum, o) => sum + (o.updatedAt.getTime() - o.createdAt.getTime()), 0) / recentOrders.length / 60000
      : 0;

    return {
      courierId,
      totalDeliveries,
      averageDeliveryTime: Math.round(avgDeliveryTime),
      rating: 0,
      onTimePercentage: 0,
      acceptanceRate: 0,
      weeklyStats: [],
    };
  }

  async getPredictions(courierId: string) {
    return {
      courierId,
      predictedDemand: 'moderate',
      suggestedAreas: [],
      peakHours: ['12:00-13:00', '18:00-20:00'],
      estimatedEarnings: 0,
    };
  }

  async getDispatch(courierId: string) {
    const pendingOrders = await this.prisma.order.findMany({
      where: { driverId: courierId, status: { in: ['ready_for_pickup', 'picked_up'] } },
      include: {
        business: { select: { businessName: true } },
        customer: { select: { firstName: true, lastName: true } },
      },
    });

    return pendingOrders.map((o) => ({
      id: o.id,
      businessName: o.business?.businessName || '',
      customerName: `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim(),
      status: o.status,
      deliveryAddress: o.deliveryAddress,
      createdAt: o.createdAt,
    }));
  }

  async getRouteOptimization(courierId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, driverId: courierId },
      select: { id: true, deliveryAddress: true, pickupAddress: true },
    });

    return {
      orderId,
      optimizedRoute: [],
      estimatedTime: 0,
      distance: 0,
      pickupAddress: order?.pickupAddress || '',
      deliveryAddress: order?.deliveryAddress || '',
    };
  }

  async getDeliveryMethods(courierId: string) {
    return [
      { id: 'bike', name: 'Bicycle', icon: 'bicycle', active: false },
      { id: 'motorcycle', name: 'Motorcycle', icon: 'speedometer', active: true },
      { id: 'car', name: 'Car', icon: 'car', active: false },
    ];
  }
}
