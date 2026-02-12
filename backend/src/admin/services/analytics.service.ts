import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // Custom Reports
  async createCustomReport(data: {
    name: string;
    description?: string;
    type: string;
    filters: any;
    columns: string[];
    schedule?: string;
    recipients: string[];
    format?: string;
    createdBy: string;
  }) {
    const nextRun = data.schedule ? this.calculateNextRun(data.schedule) : null;

    return this.prisma.customReport.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        filters: data.filters,
        columns: data.columns,
        schedule: data.schedule,
        recipients: data.recipients,
        format: data.format || 'csv',
        nextRun,
        createdBy: data.createdBy,
      },
    });
  }

  async getCustomReports(createdBy?: string) {
    return this.prisma.customReport.findMany({
      where: {
        isActive: true,
        ...(createdBy && { createdBy }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async runCustomReport(reportId: string) {
    const report = await this.prisma.customReport.findUnique({
      where: { id: reportId },
    });
    if (!report) throw new Error('Report not found');

    const data = await this.generateReportData(report.type, report.filters, report.columns);

    await this.prisma.customReport.update({
      where: { id: reportId },
      data: {
        lastRun: new Date(),
        nextRun: report.schedule ? this.calculateNextRun(report.schedule) : null,
      },
    });

    return data;
  }

  private async generateReportData(type: string, filters: any, columns: string[]) {
    switch (type) {
      case 'revenue':
        return this.generateRevenueReport(filters, columns);
      case 'orders':
        return this.generateOrdersReport(filters, columns);
      case 'users':
        return this.generateUsersReport(filters, columns);
      case 'merchants':
        return this.generateMerchantsReport(filters, columns);
      default:
        throw new Error('Unknown report type');
    }
  }

  private async generateRevenueReport(filters: any, columns: string[]) {
    const where: any = {};
    if (filters.startDate) where.createdAt = { gte: new Date(filters.startDate) };
    if (filters.endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) };
    }

    const revenues = await this.prisma.platformRevenue.findMany({
      where,
      include: {
        order: {
          include: {
            business: { select: { businessName: true } },
          },
        },
      },
    });

    return revenues.map(r => ({
      orderId: r.orderId,
      businessName: r.order.business.businessName,
      orderTotal: r.orderTotal.toNumber(),
      platformFee: r.platformFee.toNumber(),
      merchantRevenue: r.merchantRevenue.toNumber(),
      netRevenue: r.netRevenue.toNumber(),
      date: r.createdAt,
    }));
  }

  private async generateOrdersReport(filters: any, columns: string[]) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.startDate) where.createdAt = { gte: new Date(filters.startDate) };
    if (filters.endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        customer: { select: { firstName: true, lastName: true, email: true } },
        business: { select: { businessName: true } },
        driver: { select: { firstName: true, lastName: true } },
      },
    });

    return orders.map(o => ({
      orderNumber: o.orderNumber,
      customer: `${o.customer.firstName} ${o.customer.lastName}`,
      business: o.business.businessName,
      driver: o.driver ? `${o.driver.firstName} ${o.driver.lastName}` : null,
      status: o.status,
      total: o.totalAmount.toNumber(),
      date: o.createdAt,
    }));
  }

  private async generateUsersReport(filters: any, columns: string[]) {
    const where: any = {};
    if (filters.role) where.role = filters.role;
    if (filters.status) where.status = filters.status;

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    return users;
  }

  private async generateMerchantsReport(filters: any, columns: string[]) {
    const merchants = await this.prisma.businessProfile.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, status: true } },
        orders: {
          where: { paymentStatus: 'paid' },
          select: { totalAmount: true },
        },
      },
    });

    return merchants.map(m => ({
      businessName: m.businessName,
      ownerName: `${m.user.firstName} ${m.user.lastName}`,
      email: m.user.email,
      status: m.user.status,
      totalOrders: m.orders.length,
      totalRevenue: m.orders.reduce((sum, o) => sum.add(o.totalAmount), new Prisma.Decimal(0)).toNumber(),
    }));
  }

  private calculateNextRun(schedule: string): Date {
    const now = new Date();
    switch (schedule) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const next = new Date(now);
        next.setMonth(next.getMonth() + 1);
        return next;
      default:
        return now;
    }
  }

  // Cohort Analysis
  async generateCohortAnalysis(cohortType: 'customer' | 'merchant' | 'courier', startDate: Date, endDate: Date) {
    const cohorts: Map<string, any> = new Map();

    const users = await this.prisma.user.findMany({
      where: {
        role: cohortType === 'customer' ? 'customer' : cohortType === 'merchant' ? 'business_owner' : 'driver',
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        ordersAsCustomer: {
          select: { createdAt: true, totalAmount: true },
        },
      },
    });

    users.forEach(user => {
      const cohortDate = new Date(user.createdAt);
      cohortDate.setDate(1); // First day of month
      const cohortKey = cohortDate.toISOString().split('T')[0];

      if (!cohorts.has(cohortKey)) {
        cohorts.set(cohortKey, {
          cohortDate: cohortDate,
          userCount: 0,
          retention: {},
          ltv: new Prisma.Decimal(0),
        });
      }

      const cohort = cohorts.get(cohortKey);
      cohort.userCount++;

      // Calculate retention and LTV
      user.ordersAsCustomer.forEach(order => {
        const monthsSinceCohort = this.getMonthsDifference(cohortDate, order.createdAt);
        cohort.retention[monthsSinceCohort] = (cohort.retention[monthsSinceCohort] || 0) + 1;
        cohort.ltv = cohort.ltv.add(order.totalAmount);
      });
    });

    // Save cohort analysis
    const results = [];
    for (const [key, cohort] of cohorts) {
      const avgLTV = cohort.userCount > 0 ? cohort.ltv.div(cohort.userCount) : new Prisma.Decimal(0);
      
      const saved = await this.prisma.cohortAnalysis.upsert({
        where: {
          cohortDate_cohortType: {
            cohortDate: cohort.cohortDate,
            cohortType,
          },
        },
        create: {
          cohortDate: cohort.cohortDate,
          cohortType,
          userCount: cohort.userCount,
          metrics: {
            retention: cohort.retention,
            avgLTV: avgLTV.toNumber(),
          },
        },
        update: {
          userCount: cohort.userCount,
          metrics: {
            retention: cohort.retention,
            avgLTV: avgLTV.toNumber(),
          },
        },
      });

      results.push(saved);
    }

    return results;
  }

  async getCohortAnalysis(cohortType: string, startDate?: Date, endDate?: Date) {
    const where: any = { cohortType };
    if (startDate || endDate) {
      where.cohortDate = {};
      if (startDate) where.cohortDate.gte = startDate;
      if (endDate) where.cohortDate.lte = endDate;
    }

    return this.prisma.cohortAnalysis.findMany({
      where,
      orderBy: { cohortDate: 'asc' },
    });
  }

  private getMonthsDifference(date1: Date, date2: Date): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  }

  // Funnel Analysis
  async getFunnelAnalysis(startDate: Date, endDate: Date) {
    const [
      totalVisitors,
      accountCreated,
      firstSearch,
      addedToCart,
      checkout,
      orderPlaced,
      orderCompleted,
    ] = await Promise.all([
      // These would come from analytics tracking
      this.prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate }, emailVerified: true },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate }, role: 'customer' },
      }),
      // Simplified - would need cart tracking
      this.prisma.order.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: startDate, lte: endDate }, status: { not: 'pending' } },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: startDate, lte: endDate }, paymentStatus: 'paid' },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: startDate, lte: endDate }, status: 'delivered' },
      }),
    ]);

    return {
      stages: [
        { name: 'Visitors', count: totalVisitors, percentage: 100 },
        { name: 'Account Created', count: accountCreated, percentage: (accountCreated / totalVisitors) * 100 },
        { name: 'First Search', count: firstSearch, percentage: (firstSearch / totalVisitors) * 100 },
        { name: 'Added to Cart', count: addedToCart, percentage: (addedToCart / totalVisitors) * 100 },
        { name: 'Checkout', count: checkout, percentage: (checkout / totalVisitors) * 100 },
        { name: 'Order Placed', count: orderPlaced, percentage: (orderPlaced / totalVisitors) * 100 },
        { name: 'Order Completed', count: orderCompleted, percentage: (orderCompleted / totalVisitors) * 100 },
      ],
      conversionRate: totalVisitors > 0 ? (orderCompleted / totalVisitors) * 100 : 0,
    };
  }
}
