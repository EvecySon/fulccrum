import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../messaging/email.service';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

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

  async verifyMerchant(merchantId: string) {
    return this.prisma.businessProfile.update({
      where: { userId: merchantId },
      data: {
        verificationStatus: 'verified',
        verificationDate: new Date(),
      },
    });
  }

  async inviteMerchant(email: string, businessName: string, ownerName: string, phone?: string, commission?: number) {
    const tempPassword = randomBytes(8).toString('hex');
    const nameParts = ownerName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: tempPassword,
        role: 'business_owner',
        status: 'active',
        firstName,
        lastName,
        phone: phone || undefined,
      },
    });
    await this.prisma.businessProfile.create({
      data: {
        userId: user.id,
        businessName,
        businessType: 'restaurant',
      },
    });
    return { message: 'Merchant invited', userId: user.id, email };
  }

  async inviteCourier(email: string, firstName: string, lastName: string) {
    const tempPassword = randomBytes(8).toString('hex');
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: tempPassword,
        role: 'driver',
        status: 'active',
        firstName,
        lastName,
      },
    });
    await this.prisma.driverProfile.create({
      data: {
        userId: user.id,
        vehicleType: 'motorcycle',
        licensePlate: '',
      },
    });
    return { message: 'Courier invited', userId: user.id, email };
  }

  async approveCourier(courierId: string, approved: boolean, notes?: string) {
    const status = approved ? 'active' : 'suspended';
    await this.prisma.user.update({
      where: { id: courierId },
      data: { status },
    });
    return { message: approved ? 'Courier approved' : 'Courier rejected', courierId, notes };
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

  async createAdmin(userRole: string, data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    this.verifyAdmin(userRole);

    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const admin = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'admin',
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return { message: 'Admin user created successfully', user: admin };
  }

  async getAdminUsers(userRole: string) {
    this.verifyAdmin(userRole);

    const admins = await this.prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: admins };
  }

  async removeAdmin(userRole: string, adminId: string, requesterId: string) {
    this.verifyAdmin(userRole);

    if (adminId === requesterId) {
      throw new BadRequestException('You cannot remove yourself as admin');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, role: true },
    });

    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (target.role !== 'admin') {
      throw new BadRequestException('User is not an admin');
    }

    await this.prisma.user.update({
      where: { id: adminId },
      data: { role: 'customer', status: 'suspended' },
    });

    return { message: 'Admin access removed' };
  }

  async getAllCouriers(userRole: string, page = 1, limit = 50) {
    this.verifyAdmin(userRole);
    const skip = (page - 1) * limit;
    const [couriers, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: 'driver' },
        skip,
        take: limit,
        include: { driverProfile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { role: 'driver' } }),
    ]);
    return { data: couriers, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getPendingCouriers(userRole: string, page = 1, limit = 50) {
    this.verifyAdmin(userRole);
    const skip = (page - 1) * limit;
    const [couriers, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: 'driver', status: 'inactive' },
        skip,
        take: limit,
        include: { driverProfile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { role: 'driver', status: 'inactive' } }),
    ]);
    return { data: couriers, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getMerchantApplication(userRole: string, merchantId: string) {
    this.verifyAdmin(userRole);
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId: merchantId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, status: true, createdAt: true } },
      },
    });
    if (!profile) throw new NotFoundException('Merchant not found');
    return profile;
  }

  async getMerchantDocuments(userRole: string, merchantId: string) {
    this.verifyAdmin(userRole);
    // TODO: Implement document storage model — for now return empty array
    return { data: [], merchantId };
  }

  async getCourierDocuments(userRole: string, courierId: string) {
    this.verifyAdmin(userRole);
    // TODO: Implement document storage model — for now return empty array
    return { data: [], courierId };
  }

  async verifyDocument(userRole: string, userId: string, docId: string) {
    this.verifyAdmin(userRole);
    // TODO: Update document status in DB once document model exists
    return { message: 'Document verified', userId, docId };
  }

  async rejectDocument(userRole: string, userId: string, docId: string, reason: string) {
    this.verifyAdmin(userRole);
    // TODO: Update document status in DB once document model exists
    return { message: 'Document rejected', userId, docId, reason };
  }

  async requestDocuments(userRole: string, merchantId: string, documentTypes: string[]) {
    this.verifyAdmin(userRole);
    // TODO: Send email/notification to merchant requesting missing documents
    return { message: 'Document request sent', merchantId, documentTypes };
  }
}
