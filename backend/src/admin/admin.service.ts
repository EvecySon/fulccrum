import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private verifyAdmin(userRole: string) {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  async getAllUsers(userRole: string, page = 1, limit = 50) {
    this.verifyAdmin(userRole);

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return { data: users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async suspendUser(userRole: string, userId: string) {
    this.verifyAdmin(userRole);

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'suspended' },
    });
  }

  async activateUser(userRole: string, userId: string) {
    this.verifyAdmin(userRole);

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'active' },
    });
  }

  async getAllOrders(userRole: string, page = 1, limit = 50) {
    this.verifyAdmin(userRole);

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        include: {
          customer: { select: { firstName: true, lastName: true, email: true } },
          driver: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count(),
    ]);

    return { data: orders, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getPlatformMetrics(userRole: string) {
    this.verifyAdmin(userRole);

    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      activeDrivers,
      pendingWithdrawals,
      totalBusinesses,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { totalAmount: true },
      }),
      this.prisma.driverProfile.count({ where: { onlineStatus: true } }),
      this.prisma.withdrawalRequest.count({ where: { status: 'pending' } }),
      this.prisma.businessProfile.count(),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      activeDrivers,
      pendingWithdrawals,
      totalBusinesses,
    };
  }

  async getPendingWithdrawals(userRole: string, page = 1, limit = 50) {
    this.verifyAdmin(userRole);

    const skip = (page - 1) * limit;
    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawalRequest.findMany({
        where: { status: { in: ['pending', 'confirmed'] } },
        skip,
        take: limit,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { requestedAt: 'desc' },
      }),
      this.prisma.withdrawalRequest.count({ where: { status: { in: ['pending', 'confirmed'] } } }),
    ]);

    return { data: withdrawals, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async approveWithdrawal(userRole: string, withdrawalId: string) {
    this.verifyAdmin(userRole);

    return this.prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status: 'processing' },
    });
  }

  async rejectWithdrawal(userRole: string, withdrawalId: string, reason: string) {
    this.verifyAdmin(userRole);

    return this.prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { 
        status: 'failed',
        failedReason: reason,
      },
    });
  }

  async getRecentActivity(userRole: string, limit = 20) {
    this.verifyAdmin(userRole);

    const [recentOrders, recentUsers] = await Promise.all([
      this.prisma.order.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          customer: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      recentOrders,
      recentUsers,
    };
  }

  async approveMerchant(userRole: string, merchantId: string) {
    this.verifyAdmin(userRole);

    return this.prisma.businessProfile.update({
      where: { userId: merchantId },
      data: {
        verificationStatus: 'verified',
        verificationDate: new Date(),
      },
    });
  }

  async rejectMerchant(userRole: string, merchantId: string) {
    this.verifyAdmin(userRole);

    return this.prisma.businessProfile.update({
      where: { userId: merchantId },
      data: {
        verificationStatus: 'rejected',
      },
    });
  }

  async getPendingMerchants(userRole: string, page = 1, limit = 50) {
    this.verifyAdmin(userRole);

    const skip = (page - 1) * limit;
    const [merchants, total] = await Promise.all([
      this.prisma.businessProfile.findMany({
        where: { verificationStatus: 'pending' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.businessProfile.count({ where: { verificationStatus: 'pending' } }),
    ]);

    return { data: merchants, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
