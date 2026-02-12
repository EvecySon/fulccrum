import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ModerationService {
  constructor(private prisma: PrismaService) {}

  async addToQueue(data: {
    type: 'menu_item' | 'photo' | 'review' | 'business_profile';
    resourceId: string;
    resourceData: any;
    flags?: string[];
  }) {
    return this.prisma.contentModerationQueue.create({
      data: {
        type: data.type,
        resourceId: data.resourceId,
        resourceData: data.resourceData,
        flags: data.flags || [],
        status: 'pending',
      },
    });
  }

  async getQueue(filters?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;

    const [items, total] = await Promise.all([
      this.prisma.contentModerationQueue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.contentModerationQueue.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async approve(itemId: string, reviewedBy: string) {
    return this.prisma.contentModerationQueue.update({
      where: { id: itemId },
      data: {
        status: 'approved',
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  }

  async reject(itemId: string, reviewedBy: string, reason: string) {
    return this.prisma.contentModerationQueue.update({
      where: { id: itemId },
      data: {
        status: 'rejected',
        reviewedBy,
        reviewedAt: new Date(),
        reason,
      },
    });
  }

  async getModerationStats(startDate: Date, endDate: Date) {
    const items = await this.prisma.contentModerationQueue.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const total = items.length;
    const approved = items.filter(i => i.status === 'approved').length;
    const rejected = items.filter(i => i.status === 'rejected').length;
    const pending = items.filter(i => i.status === 'pending').length;

    const byType = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      approved,
      rejected,
      pending,
      approvalRate: total > 0 ? (approved / total) * 100 : 0,
      byType,
    };
  }
}
