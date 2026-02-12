import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RefundService {
  constructor(private prisma: PrismaService) {}

  async createRefund(data: {
    orderId: string;
    amount: number;
    reason: string;
    type: 'full' | 'partial' | 'goodwill';
    requestedBy: string;
  }) {
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (data.type === 'full' && new Prisma.Decimal(data.amount).gt(order.totalAmount)) {
      throw new BadRequestException('Refund amount cannot exceed order total');
    }

    return this.prisma.refund.create({
      data: {
        orderId: data.orderId,
        amount: new Prisma.Decimal(data.amount),
        reason: data.reason,
        type: data.type,
        requestedBy: data.requestedBy,
        status: 'pending',
      },
      include: {
        order: {
          include: {
            customer: { select: { firstName: true, lastName: true, email: true } },
            business: { select: { businessName: true } },
          },
        },
      },
    });
  }

  async getRefunds(status?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [refunds, total] = await Promise.all([
      this.prisma.refund.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            include: {
              customer: { select: { firstName: true, lastName: true, email: true } },
              business: { select: { businessName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refund.count({ where }),
    ]);

    return {
      data: refunds,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async approveRefund(refundId: string, approvedBy: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
      include: { order: true },
    });
    if (!refund) throw new NotFoundException('Refund not found');
    if (refund.status !== 'pending') {
      throw new BadRequestException('Refund has already been processed');
    }

    // Update refund status
    const updated = await this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'approved',
        approvedBy,
        processedAt: new Date(),
      },
    });

    // Update order payment status
    await this.prisma.order.update({
      where: { id: refund.orderId },
      data: {
        paymentStatus: refund.type === 'full' ? 'refunded' : 'partially_refunded',
      },
    });

    // TODO: Integrate with payment gateway to process actual refund

    return updated;
  }

  async rejectRefund(refundId: string, approvedBy: string, reason: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
    });
    if (!refund) throw new NotFoundException('Refund not found');
    if (refund.status !== 'pending') {
      throw new BadRequestException('Refund has already been processed');
    }

    return this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'rejected',
        approvedBy,
        rejectionReason: reason,
        processedAt: new Date(),
      },
    });
  }

  async getRefundStats(startDate: Date, endDate: Date) {
    const refunds = await this.prisma.refund.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const totalRefunds = refunds.length;
    const approvedRefunds = refunds.filter(r => r.status === 'approved').length;
    const rejectedRefunds = refunds.filter(r => r.status === 'rejected').length;
    const pendingRefunds = refunds.filter(r => r.status === 'pending').length;
    const totalAmount = refunds
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum.add(r.amount), new Prisma.Decimal(0));

    return {
      totalRefunds,
      approvedRefunds,
      rejectedRefunds,
      pendingRefunds,
      totalAmount: totalAmount.toNumber(),
      approvalRate: totalRefunds > 0 ? (approvedRefunds / totalRefunds) * 100 : 0,
    };
  }
}
