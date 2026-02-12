import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CommissionService } from './commission.service';

@Injectable()
export class FinanceService {
  constructor(
    private prisma: PrismaService,
    private commissionService: CommissionService,
  ) {}

  // Revenue Reconciliation
  async reconcileOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: true,
        driver: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    // Calculate commission
    const commission = await this.commissionService.calculateCommission(orderId);

    // Calculate splits
    const platformFee = commission.total;
    const taxAmount = order.taxAmount;
    const paymentFee = order.totalAmount.mul(new Prisma.Decimal(0.015)); // 1.5% payment gateway fee
    
    const merchantRevenue = order.subtotal.sub(platformFee);
    const courierRevenue = order.deliveryFee.add(order.tipAmount);
    const netRevenue = platformFee.sub(paymentFee);

    // Create or update platform revenue record
    const existing = await this.prisma.platformRevenue.findUnique({
      where: { orderId },
    });

    if (existing) {
      return this.prisma.platformRevenue.update({
        where: { orderId },
        data: {
          orderTotal: order.totalAmount,
          merchantRevenue,
          courierRevenue,
          platformFee,
          commissionRate: commission.rate,
          taxAmount,
          paymentFee,
          netRevenue,
          reconciledAt: new Date(),
        },
      });
    }

    return this.prisma.platformRevenue.create({
      data: {
        orderId,
        orderTotal: order.totalAmount,
        merchantRevenue,
        courierRevenue,
        platformFee,
        commissionRate: commission.rate,
        taxAmount,
        paymentFee,
        netRevenue,
        reconciledAt: new Date(),
      },
    });
  }

  async getRevenueAnalytics(startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month' = 'day') {
    const revenues = await this.prisma.platformRevenue.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        order: {
          include: {
            business: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalRevenue = revenues.reduce((sum, r) => sum.add(r.orderTotal), new Prisma.Decimal(0));
    const totalPlatformFee = revenues.reduce((sum, r) => sum.add(r.platformFee), new Prisma.Decimal(0));
    const totalMerchantRevenue = revenues.reduce((sum, r) => sum.add(r.merchantRevenue), new Prisma.Decimal(0));
    const totalCourierRevenue = revenues.reduce((sum, r) => sum.add(r.courierRevenue), new Prisma.Decimal(0));
    const totalNetRevenue = revenues.reduce((sum, r) => sum.add(r.netRevenue), new Prisma.Decimal(0));

    return {
      summary: {
        totalOrders: revenues.length,
        totalRevenue: totalRevenue.toNumber(),
        platformFee: totalPlatformFee.toNumber(),
        merchantRevenue: totalMerchantRevenue.toNumber(),
        courierRevenue: totalCourierRevenue.toNumber(),
        netRevenue: totalNetRevenue.toNumber(),
        avgOrderValue: revenues.length > 0 ? totalRevenue.div(revenues.length).toNumber() : 0,
      },
      details: revenues.map(r => ({
        orderId: r.orderId,
        orderNumber: r.order.orderNumber,
        businessName: r.order.business.businessName,
        orderTotal: r.orderTotal.toNumber(),
        platformFee: r.platformFee.toNumber(),
        merchantRevenue: r.merchantRevenue.toNumber(),
        courierRevenue: r.courierRevenue.toNumber(),
        netRevenue: r.netRevenue.toNumber(),
        commissionRate: r.commissionRate.toNumber(),
        createdAt: r.createdAt,
      })),
    };
  }

  async getRevenueForecast(days: number = 30) {
    const now = new Date();
    const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const historicalRevenue = await this.prisma.platformRevenue.findMany({
      where: {
        createdAt: { gte: pastDate },
      },
      select: {
        netRevenue: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (historicalRevenue.length === 0) {
      return { forecast: [], avgDailyRevenue: 0, projectedMonthlyRevenue: 0 };
    }

    // Simple moving average forecast
    const totalRevenue = historicalRevenue.reduce((sum, r) => sum.add(r.netRevenue), new Prisma.Decimal(0));
    const avgDailyRevenue = totalRevenue.div(days);
    const projectedMonthlyRevenue = avgDailyRevenue.mul(30);

    return {
      avgDailyRevenue: avgDailyRevenue.toNumber(),
      projectedMonthlyRevenue: projectedMonthlyRevenue.toNumber(),
      historicalData: historicalRevenue.map(r => ({
        date: r.createdAt,
        revenue: r.netRevenue.toNumber(),
      })),
    };
  }

  async getMerchantSettlements(businessId?: string, status: 'pending' | 'completed' = 'pending') {
    const where: any = {};
    if (businessId) where.businessId = businessId;

    const revenues = await this.prisma.platformRevenue.findMany({
      where: {
        order: where,
        ...(status === 'pending' ? { reconciledAt: null } : { reconciledAt: { not: null } }),
      },
      include: {
        order: {
          include: {
            business: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true } },
              },
            },
          },
        },
      },
    });

    // Group by business
    const settlements = revenues.reduce((acc, r) => {
      const bid = r.order.businessId;
      if (!acc[bid]) {
        acc[bid] = {
          businessId: bid,
          businessName: r.order.business.businessName,
          ownerName: `${r.order.business.user.firstName} ${r.order.business.user.lastName}`,
          ownerEmail: r.order.business.user.email,
          totalOrders: 0,
          totalRevenue: new Prisma.Decimal(0),
          totalCommission: new Prisma.Decimal(0),
          netSettlement: new Prisma.Decimal(0),
        };
      }
      acc[bid].totalOrders++;
      acc[bid].totalRevenue = acc[bid].totalRevenue.add(r.orderTotal);
      acc[bid].totalCommission = acc[bid].totalCommission.add(r.platformFee);
      acc[bid].netSettlement = acc[bid].netSettlement.add(r.merchantRevenue);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(settlements).map((s: any) => ({
      ...s,
      totalRevenue: s.totalRevenue.toNumber(),
      totalCommission: s.totalCommission.toNumber(),
      netSettlement: s.netSettlement.toNumber(),
    }));
  }

  async exportFinancialReport(startDate: Date, endDate: Date, format: 'csv' | 'json' = 'json') {
    const analytics = await this.getRevenueAnalytics(startDate, endDate);
    
    if (format === 'json') {
      return analytics;
    }

    // CSV format
    const headers = ['Order ID', 'Order Number', 'Business', 'Order Total', 'Platform Fee', 'Merchant Revenue', 'Courier Revenue', 'Net Revenue', 'Commission Rate', 'Date'];
    const rows = analytics.details.map(d => [
      d.orderId,
      d.orderNumber,
      d.businessName,
      d.orderTotal,
      d.platformFee,
      d.merchantRevenue,
      d.courierRevenue,
      d.netRevenue,
      d.commissionRate,
      d.createdAt.toISOString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }
}
