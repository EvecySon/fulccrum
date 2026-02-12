import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getMerchantAnalytics(businessId: string, period: string) {
    const now = new Date();
    const startDate = new Date();
    const prevStart = new Date();
    const prevEnd = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        prevStart.setDate(now.getDate() - 14);
        prevEnd.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        prevStart.setDate(now.getDate() - 60);
        prevEnd.setDate(now.getDate() - 30);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        prevStart.setFullYear(now.getFullYear() - 2);
        prevEnd.setFullYear(now.getFullYear() - 1);
        break;
      default: // today
        startDate.setHours(0, 0, 0, 0);
        prevStart.setDate(now.getDate() - 1);
        prevStart.setHours(0, 0, 0, 0);
        prevEnd.setDate(now.getDate() - 1);
        prevEnd.setHours(23, 59, 59, 999);
        break;
    }

    const currentWhere = { businessId, createdAt: { gte: startDate } };
    const prevWhere = { businessId, createdAt: { gte: prevStart, lte: prevEnd } };
    const paidCurrentWhere = { ...currentWhere, paymentStatus: 'paid' as const };
    const paidPrevWhere = { ...prevWhere, paymentStatus: 'paid' as const };

    // KPI queries
    const [
      currentOrders,
      prevOrders,
      currentRevenue,
      prevRevenue,
      cancelledCurrent,
      cancelledPrev,
      allCurrentOrders,
      rating,
    ] = await Promise.all([
      this.prisma.order.count({ where: currentWhere }),
      this.prisma.order.count({ where: prevWhere }),
      this.prisma.order.aggregate({ where: paidCurrentWhere, _sum: { totalAmount: true } }),
      this.prisma.order.aggregate({ where: paidPrevWhere, _sum: { totalAmount: true } }),
      this.prisma.order.count({ where: { ...currentWhere, status: 'cancelled' } }),
      this.prisma.order.count({ where: { ...prevWhere, status: 'cancelled' } }),
      this.prisma.order.findMany({
        where: currentWhere,
        include: { items: { include: { menuItem: { select: { name: true } } } } },
      }),
      this.prisma.businessProfile.findUnique({ where: { userId: businessId }, select: { rating: true } }),
    ]);

    const rev = Number(currentRevenue._sum.totalAmount || 0);
    const prevRev = Number(prevRevenue._sum.totalAmount || 0);
    const avgOrder = currentOrders > 0 ? rev / currentOrders : 0;
    const prevAvg = prevOrders > 0 ? prevRev / prevOrders : 0;
    const cancelRate = currentOrders > 0 ? (cancelledCurrent / currentOrders) * 100 : 0;
    const prevCancelRate = prevOrders > 0 ? (cancelledPrev / prevOrders) * 100 : 0;

    const pctChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const change = ((curr - prev) / prev) * 100;
      return `${change >= 0 ? '+' : ''}${Math.round(change)}%`;
    };

    // Hourly orders
    const hourlyMap: { [h: number]: number } = {};
    for (let h = 0; h < 24; h++) hourlyMap[h] = 0;
    allCurrentOrders.forEach((o: any) => {
      const h = new Date(o.createdAt).getHours();
      hourlyMap[h]++;
    });
    const hourlyOrders = Object.entries(hourlyMap).map(([h, count]) => ({
      hour: `${String(h).padStart(2, '0')}:00`,
      orders: count,
    }));

    // Peak hours
    const sorted = [...hourlyOrders].sort((a, b) => b.orders - a.orders);
    const maxOrders = sorted[0]?.orders || 1;
    const peakHours = sorted.slice(0, 4).map((h) => ({
      time: h.hour,
      label: parseInt(h.hour) < 12 ? 'Morning' : parseInt(h.hour) < 17 ? 'Afternoon' : 'Evening',
      intensity: Math.round((h.orders / maxOrders) * 100),
    }));

    // Top selling items
    const itemMap: { [key: string]: { name: string; orders: number; revenue: number } } = {};
    allCurrentOrders.forEach((o: any) => {
      (o.items || []).forEach((item: any) => {
        const name = item.menuItem?.name || 'Unknown';
        if (!itemMap[name]) itemMap[name] = { name, orders: 0, revenue: 0 };
        itemMap[name].orders += item.quantity;
        itemMap[name].revenue += Number(item.price) * item.quantity;
      });
    });
    const topItems = Object.values(itemMap)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)
      .map((item) => ({ ...item, revenue: Math.round(item.revenue * 100) / 100 }));

    // Customer insights
    const customerIds = [...new Set(allCurrentOrders.map((o: any) => o.customerId).filter(Boolean))];
    let repeatCount = 0;
    if (customerIds.length > 0) {
      const repeatCustomers = await this.prisma.order.groupBy({
        by: ['customerId'],
        where: { businessId, customerId: { in: customerIds as string[] } },
        _count: true,
        having: { customerId: { _count: { gt: 1 } } },
      });
      repeatCount = repeatCustomers.length;
    }

    return {
      kpis: {
        revenue: { total: Math.round(rev * 100) / 100, change: pctChange(rev, prevRev), positive: rev >= prevRev },
        orders: { total: currentOrders, change: pctChange(currentOrders, prevOrders), positive: currentOrders >= prevOrders },
        avgOrder: { total: Math.round(avgOrder * 100) / 100, change: pctChange(avgOrder, prevAvg), positive: avgOrder >= prevAvg },
        cancelRate: { total: Math.round(cancelRate * 10) / 10, change: pctChange(cancelRate, prevCancelRate), positive: cancelRate <= prevCancelRate },
      },
      hourlyOrders,
      peakHours,
      topItems,
      customerInsights: {
        newCustomers: customerIds.length,
        returning: customerIds.length > 0 ? Math.round((repeatCount / customerIds.length) * 100) : 0,
        avgRating: Number(rating?.rating || 0),
        totalReviews: 0,
      },
    };
  }

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

  async getTopPerformers(type: 'drivers' | 'businesses' | 'items', limit = 10) {
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

    if (type === 'items') {
      // Get top menu items by order count
      const items = await this.prisma.orderItem.groupBy({
        by: ['menuItemId'],
        _count: { menuItemId: true },
        orderBy: { _count: { menuItemId: 'desc' } },
        take: limit,
      });

      // Fetch full menu item details
      const menuItemIds = items.map(item => item.menuItemId);
      const menuItems = await this.prisma.menuItem.findMany({
        where: { id: { in: menuItemIds } },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
          category: true,
        },
      });

      // Merge counts with menu item data
      return menuItems.map(item => {
        const orderCount = items.find(i => i.menuItemId === item.id)?._count.menuItemId || 0;
        return { ...item, orderCount };
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

  // Advanced Analytics - Forecasting
  async getRevenueForecast(businessId?: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      paymentStatus: 'paid',
      createdAt: { gte: startDate },
    };

    if (businessId) {
      where.businessId = businessId;
    }

    const orders = await this.prisma.order.findMany({
      where,
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const dailyRevenue: { [key: string]: number } = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + order.totalAmount.toNumber();
    });

    const revenues = Object.values(dailyRevenue);
    const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;

    // Simple linear regression for trend
    const n = revenues.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    revenues.forEach((revenue, index) => {
      sumX += index;
      sumY += revenue;
      sumXY += index * revenue;
      sumX2 += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Forecast next 7 days
    const forecast = [];
    for (let i = 0; i < 7; i++) {
      const day = n + i;
      const predictedRevenue = slope * day + intercept;
      forecast.push({
        day: i + 1,
        predictedRevenue: Math.max(0, Math.round(predictedRevenue * 100) / 100),
      });
    }

    return {
      historicalData: dailyRevenue,
      averageDailyRevenue: Math.round(avgRevenue * 100) / 100,
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      trendPercentage: Math.round((slope / avgRevenue) * 100 * 100) / 100,
      forecast,
    };
  }

  async getOrderTrends(businessId?: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      createdAt: { gte: startDate },
    };

    if (businessId) {
      where.businessId = businessId;
    }

    const orders = await this.prisma.order.findMany({
      where,
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Group by day
    const dailyOrders: { [key: string]: number } = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailyOrders[date] = (dailyOrders[date] || 0) + 1;
    });

    const orderCounts = Object.values(dailyOrders);
    const avgOrders = orderCounts.reduce((a, b) => a + b, 0) / orderCounts.length;

    // Peak hours analysis
    const hourlyOrders: { [key: number]: number } = {};
    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourlyOrders).reduce((a, b) =>
      b[1] > a[1] ? b : a,
    );

    return {
      dailyOrders,
      averageDailyOrders: Math.round(avgOrders * 100) / 100,
      peakHour: {
        hour: parseInt(peakHour[0]),
        orders: peakHour[1],
      },
      totalOrders: orders.length,
    };
  }

  async getCustomerInsights(businessId?: string) {
    const where: any = {};
    if (businessId) {
      where.businessId = businessId;
    }

    const [totalCustomers, repeatCustomers, avgOrderValue] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['customerId'],
        where,
        _count: true,
      }),
      this.prisma.order.groupBy({
        by: ['customerId'],
        where,
        _count: true,
        having: {
          customerId: {
            _count: {
              gt: 1,
            },
          },
        },
      }),
      this.prisma.order.aggregate({
        where: { ...where, paymentStatus: 'paid' },
        _avg: { totalAmount: true },
      }),
    ]);

    const retentionRate =
      totalCustomers.length > 0
        ? (repeatCustomers.length / totalCustomers.length) * 100
        : 0;

    return {
      totalCustomers: totalCustomers.length,
      repeatCustomers: repeatCustomers.length,
      retentionRate: Math.round(retentionRate * 100) / 100,
      averageOrderValue: Math.round((avgOrderValue._avg.totalAmount?.toNumber() || 0) * 100) / 100,
    };
  }

  async getPredictiveAnalytics(businessId?: string) {
    const [revenueForecast, orderTrends, customerInsights] = await Promise.all([
      this.getRevenueForecast(businessId),
      this.getOrderTrends(businessId),
      this.getCustomerInsights(businessId),
    ]);

    return {
      revenueForecast,
      orderTrends,
      customerInsights,
      recommendations: this.generateRecommendations(
        revenueForecast,
        orderTrends,
        customerInsights,
      ),
    };
  }

  private generateRecommendations(revenueForecast: any, orderTrends: any, customerInsights: any) {
    const recommendations = [];

    if (revenueForecast.trend === 'decreasing') {
      recommendations.push({
        type: 'revenue',
        priority: 'high',
        message: 'Revenue is trending downward. Consider running promotions or improving service quality.',
      });
    }

    if (customerInsights.retentionRate < 30) {
      recommendations.push({
        type: 'retention',
        priority: 'high',
        message: 'Low customer retention rate. Focus on customer satisfaction and loyalty programs.',
      });
    }

    if (orderTrends.peakHour) {
      recommendations.push({
        type: 'operations',
        priority: 'medium',
        message: `Peak order time is ${orderTrends.peakHour.hour}:00. Ensure adequate staffing during this period.`,
      });
    }

    if (revenueForecast.trend === 'increasing') {
      recommendations.push({
        type: 'growth',
        priority: 'low',
        message: 'Revenue is growing steadily. Consider expanding delivery zones or menu offerings.',
      });
    }

    return recommendations;
  }
}
