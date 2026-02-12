import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    adminUserId: string;
    action: string;
    resource: string;
    resourceId: string;
    changes?: any;
    ipAddress: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        adminUserId: data.adminUserId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        changes: data.changes || null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async getLogs(filters?: {
    adminUserId?: string;
    resource?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.adminUserId) where.adminUserId = filters.adminUserId;
    if (filters?.resource) where.resource = filters.resource;
    if (filters?.action) where.action = filters.action;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          admin: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
              role: {
                select: { name: true, displayName: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getResourceHistory(resource: string, resourceId: string) {
    return this.prisma.auditLog.findMany({
      where: { resource, resourceId },
      include: {
        admin: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    resource?: string;
  }) {
    const where: any = {};
    if (filters?.resource) where.resource = filters.resource;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      include: {
        admin: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            role: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const csv = [
      ['Timestamp', 'Admin', 'Role', 'Action', 'Resource', 'Resource ID', 'IP Address'],
      ...logs.map(log => [
        log.createdAt.toISOString(),
        `${log.admin.user.firstName} ${log.admin.user.lastName}`,
        log.admin.role.name,
        log.action,
        log.resource,
        log.resourceId,
        log.ipAddress,
      ]),
    ].map(row => row.join(',')).join('\n');

    return csv;
  }
}
