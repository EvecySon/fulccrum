import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommissionService {
  constructor(private prisma: PrismaService) {}

  // Commission Tiers Management
  async createTier(data: {
    name: string;
    businessType: string;
    minOrders: number;
    maxOrders?: number;
    percentage: number;
    flatFee?: number;
    description?: string;
  }) {
    return this.prisma.commissionTier.create({
      data: {
        ...data,
        percentage: new Prisma.Decimal(data.percentage),
        flatFee: data.flatFee ? new Prisma.Decimal(data.flatFee) : null,
      },
    });
  }

  async getTiers(businessType?: string, isActive?: boolean) {
    return this.prisma.commissionTier.findMany({
      where: {
        ...(businessType && { businessType }),
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: [{ businessType: 'asc' }, { minOrders: 'asc' }],
    });
  }

  async getTier(id: string) {
    const tier = await this.prisma.commissionTier.findUnique({
      where: { id },
      include: { merchantCommissions: true },
    });
    if (!tier) throw new NotFoundException('Commission tier not found');
    return tier;
  }

  async updateTier(id: string, data: Partial<{
    name: string;
    minOrders: number;
    maxOrders: number;
    percentage: number;
    flatFee: number;
    isActive: boolean;
    description: string;
  }>) {
    const updateData: any = { ...data };
    if (data.percentage !== undefined) {
      updateData.percentage = new Prisma.Decimal(data.percentage);
    }
    if (data.flatFee !== undefined) {
      updateData.flatFee = data.flatFee ? new Prisma.Decimal(data.flatFee) : null;
    }

    return this.prisma.commissionTier.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteTier(id: string) {
    // Check if tier is in use
    const inUse = await this.prisma.merchantCommission.count({
      where: { tierId: id, effectiveTo: null },
    });
    if (inUse > 0) {
      throw new BadRequestException('Cannot delete tier that is currently assigned to merchants');
    }
    return this.prisma.commissionTier.delete({ where: { id } });
  }

  // Merchant Commission Assignment
  async assignCommission(data: {
    businessId: string;
    tierId: string;
    percentage?: number;
    flatFee?: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    notes?: string;
  }) {
    // End any existing active commission for this merchant
    await this.prisma.merchantCommission.updateMany({
      where: {
        businessId: data.businessId,
        effectiveTo: null,
      },
      data: {
        effectiveTo: new Date(),
      },
    });

    // Get tier details if percentage/flatFee not provided
    const tier = await this.prisma.commissionTier.findUnique({
      where: { id: data.tierId },
    });
    if (!tier) throw new NotFoundException('Commission tier not found');

    return this.prisma.merchantCommission.create({
      data: {
        businessId: data.businessId,
        tierId: data.tierId,
        percentage: data.percentage ? new Prisma.Decimal(data.percentage) : tier.percentage,
        flatFee: data.flatFee ? new Prisma.Decimal(data.flatFee) : tier.flatFee,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo || null,
        notes: data.notes,
      },
      include: {
        tier: true,
        business: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async getMerchantCommissions(businessId: string) {
    return this.prisma.merchantCommission.findMany({
      where: { businessId },
      include: { tier: true },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async getActiveCommission(businessId: string) {
    const now = new Date();
    return this.prisma.merchantCommission.findFirst({
      where: {
        businessId,
        effectiveFrom: { lte: now },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: now } },
        ],
      },
      include: { tier: true },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  // Commission Calculation
  async calculateCommission(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const commission = await this.getActiveCommission(order.businessId);
    if (!commission) {
      // Use default platform commission
      const settings = await this.prisma.platformSettings.findFirst();
      const defaultRate = settings?.platformCommissionPercentage || new Prisma.Decimal(15);
      return {
        rate: defaultRate,
        amount: order.subtotal.mul(defaultRate).div(100),
        flatFee: new Prisma.Decimal(0),
        total: order.subtotal.mul(defaultRate).div(100),
      };
    }

    const percentageAmount = order.subtotal.mul(commission.percentage).div(100);
    const flatFeeAmount = commission.flatFee || new Prisma.Decimal(0);
    const total = percentageAmount.add(flatFeeAmount);

    return {
      rate: commission.percentage,
      amount: percentageAmount,
      flatFee: flatFeeAmount,
      total,
      tierId: commission.tierId,
      tierName: commission.tier.name,
    };
  }

  // Bulk Operations
  async bulkAssignCommission(data: {
    businessIds: string[];
    tierId: string;
    effectiveFrom: Date;
  }) {
    const results = await Promise.allSettled(
      data.businessIds.map(businessId =>
        this.assignCommission({
          businessId,
          tierId: data.tierId,
          effectiveFrom: data.effectiveFrom,
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      total: data.businessIds.length,
      successful,
      failed,
      results,
    };
  }

  // Analytics
  async getCommissionStats(startDate: Date, endDate: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: 'paid',
      },
      include: {
        platformRevenue: true,
      },
    });

    const totalRevenue = orders.reduce((sum, o) => sum.add(o.totalAmount), new Prisma.Decimal(0));
    const totalCommission = orders.reduce((sum, o) => 
      sum.add(o.platformRevenue?.platformFee || new Prisma.Decimal(0)), new Prisma.Decimal(0)
    );

    const avgCommissionRate = totalRevenue.gt(0) 
      ? totalCommission.div(totalRevenue).mul(100) 
      : new Prisma.Decimal(0);

    return {
      totalOrders: orders.length,
      totalRevenue: totalRevenue.toNumber(),
      totalCommission: totalCommission.toNumber(),
      avgCommissionRate: avgCommissionRate.toNumber(),
    };
  }
}
