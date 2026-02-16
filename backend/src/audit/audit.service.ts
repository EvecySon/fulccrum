import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogData {
  userId?: string;
  action: string;
  resource: string;
  status: 'success' | 'failure' | 'error';
  ipAddress: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          status: data.status,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: data.metadata,
        },
      });
    } catch (error) {
      // Don't throw errors from audit logging - just log to console
      console.error('[AuditService] Failed to create audit log:', error);
    }
  }

  async getLoginAttempts(userId: string, since: Date) {
    return this.prisma.auditLog.findMany({
      where: {
        userId,
        action: 'login',
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFailedLoginsByIp(ipAddress: string, since: Date) {
    return this.prisma.auditLog.count({
      where: {
        ipAddress,
        action: 'login',
        status: 'failure',
        createdAt: { gte: since },
      },
    });
  }

  async getUserAuditLogs(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getSuspiciousActivity(since: Date) {
    // Get IPs with multiple failed login attempts
    const suspiciousIps = await this.prisma.auditLog.groupBy({
      by: ['ipAddress'],
      where: {
        action: 'login',
        status: 'failure',
        createdAt: { gte: since },
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 5, // More than 5 failed attempts
          },
        },
      },
    });

    return suspiciousIps;
  }
}
