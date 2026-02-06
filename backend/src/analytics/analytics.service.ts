import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string, userRole: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (userRole === 'business_owner') {
      return this.getBusinessStats(userId, today);
    } else if (userRole === 'driver') {
      return this.getDriverStats(userId, today);
    } else if (userRole === 'admin') {
      return this.getAdminStats(today);
    }

    return this.getCustomerStats(userId, today);
  }

  private async getBusinessStats(businessId: string, today: Date) {
    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      pendingOrders,
      avgRating,
    ] = await Promise.all([
      this.prisma.order.count({ where: { businessId } }),
      this.prisma.order.count({
        where: { businessId, createdAt: { gte: today } },
      }),
      this.prisma.order.aggregate({
        where: { businessId, paymentStatus: 'paid' },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: {
          businessId,
          paymentStatus: 'paid',
          createdAt: { gte: today },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.count({
        where: { businessId, status: { in: ['pending', 'accepted'] } },
      }),
      this.prisma.businessProfile.findUnique({
        where: { userId: businessId },
        select: { rating: true },
      }),
    ]);

    return {
      totalOrders,
      todayOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      todayRevenue: Number(todayRevenue._sum.totalAmount || 0),
      pendingOrders,
      rating: Number(avgRating?.rating || 0),
    };
  }

  private async getDriverStats(driverId: string, today: Date) {
    const [
      totalDeliveries,
      todayDeliveries,
      totalEarnings,
      todayEarnings,
      activeOrders,
      rating,
    ] = await Promise.all([
      this.prisma.order.count({ where: { driverId } }),
      this.prisma.order.count({
        where: { driverId, createdAt: { gte: today } },
      }),
      this.prisma.order.aggregate({
        where: { driverId, status: 'delivered' },
        _sum: { deliveryFee: true },
      }),
      this.prisma.order.aggregate({
        where: {
          driverId,
          status: 'delivered',
          createdAt: { gte: today },
        },
        _sum: { deliveryFee: true },
      }),
      this.prisma.order.count({
        where: { driverId, status: { in: ['picked_up', 'in_transit'] } },
      }),
      this.prisma.driverProfile.findUnique({
        where: { userId: driverId },
        select: { rating: true },
      }),
    ]);

    return {
      totalDeliveries,
      todayDeliveries,
      totalEarnings: Number(totalEarnings._sum.deliveryFee || 0),
      todayEarnings: Number(todayEarnings._sum.deliveryFee || 0),
      activeOrders,
      rating: Number(rating?.rating || 0),
    };
  }

  private async getAdminStats(today: Date) {
    const [
      totalUsers,
      totalOrders,
      todayOrders,
      totalRevenue,
      activeDrivers,
      activeBusinesses,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { totalAmount: true },
      }),
      this.prisma.driverProfile.count({ where: { onlineStatus: true } }),
      this.prisma.businessProfile.count(),
    ]);

    return {
      totalUsers,
      totalOrders,
      todayOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      activeDrivers,
      activeBusinesses,
    };
  }

  private async getCustomerStats(userId: string, today: Date) {
    const [totalOrders, todayOrders, totalSpent] = await Promise.all([
      this.prisma.order.count({ where: { customerId: userId } }),
      this.prisma.order.count({
        where: { customerId: userId, createdAt: { gte: today } },
      }),
      this.prisma.order.aggregate({
        where: { customerId: userId, paymentStatus: 'paid' },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalOrders,
      todayOrders,
      totalSpent: Number(totalSpent._sum.totalAmount || 0),
    };
  }

  async getRevenueChart(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        businessId: userId,
        paymentStatus: 'paid',
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    const revenueByDay = orders.reduce((acc: any, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + Number(order.totalAmount);
      return acc;
    }, {});

    return Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }

  async getTopPerformers(type: 'drivers' | 'businesses', limit = 10) {
    if (type === 'drivers') {
      return this.prisma.driverProfile.findMany({
        take: limit,
        orderBy: { rating: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    }

    return this.prisma.businessProfile.findMany({
      take: limit,
      orderBy: { rating: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
