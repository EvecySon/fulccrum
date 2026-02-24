import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditWalletDto, DebitWalletDto } from './dto/credit-wallet.dto';

@Injectable()
export class AdminWalletService {
  constructor(private prisma: PrismaService) {}

  // Credit limits based on admin role
  private readonly CREDIT_LIMITS = {
    admin: 5000,
    super_admin: 50000,
    finance: 1000000,
  };

  async creditWallet(
    adminUserId: string,
    dto: CreditWalletDto,
    ipAddress: string,
    userAgent: string,
  ) {
    // Get admin user and their role
    const adminUser = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
      include: { role: true },
    });

    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    // Check if amount exceeds admin's limit
    const limit = this.CREDIT_LIMITS[adminUser.role.name] || 0;
    const requiresApproval = dto.amount > limit;

    // Get or create user's wallet
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: { wallet: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let wallet = user.wallet;
    if (!wallet) {
      wallet = await this.prisma.digitalWallet.create({
        data: {
          userId: dto.userId,
          balance: 0,
          currency: 'NGN',
        },
      });
    }

    if (requiresApproval) {
      // Create pending approval request
      const pendingAction = await this.prisma.auditLog.create({
        data: {
          adminUserId,
          userId: dto.userId,
          action: 'wallet_credit_pending',
          resource: 'wallet',
          resourceId: wallet.id,
          status: 'pending',
          changes: {
            amount: dto.amount,
            reason: dto.reason,
            reference: dto.reference,
            currentBalance: wallet.balance.toString(),
          },
          ipAddress,
          userAgent,
        },
      });

      return {
        success: true,
        requiresApproval: true,
        actionId: pendingAction.id,
        message: `Credit request for ₦${dto.amount.toLocaleString()} requires approval from ${adminUser.role.name === 'admin' ? 'Super Admin' : 'Finance Team'}`,
      };
    }

    // Direct credit (within limit)
    const result = await this.prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.digitalWallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: dto.amount,
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          adminUserId,
          userId: dto.userId,
          action: 'wallet_credited',
          resource: 'wallet',
          resourceId: wallet.id,
          status: 'success',
          changes: {
            amount: dto.amount,
            reason: dto.reason,
            reference: dto.reference,
            previousBalance: wallet.balance.toString(),
            newBalance: updatedWallet.balance.toString(),
          },
          ipAddress,
          userAgent,
        },
      });

      return updatedWallet;
    });

    return {
      success: true,
      requiresApproval: false,
      wallet: {
        id: result.id,
        previousBalance: wallet.balance,
        newBalance: result.balance,
        credited: dto.amount,
      },
      message: `Successfully credited ₦${dto.amount.toLocaleString()} to user's wallet`,
    };
  }

  async debitWallet(
    adminUserId: string,
    dto: DebitWalletDto,
    ipAddress: string,
    userAgent: string,
  ) {
    const adminUser = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
      include: { role: true },
    });

    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    const wallet = await this.prisma.digitalWallet.findUnique({
      where: { userId: dto.userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Debit always requires approval for security
    const limit = this.CREDIT_LIMITS[adminUser.role.name] || 0;
    const requiresApproval = dto.amount > limit;

    if (requiresApproval) {
      const pendingAction = await this.prisma.auditLog.create({
        data: {
          adminUserId,
          userId: dto.userId,
          action: 'wallet_debit_pending',
          resource: 'wallet',
          resourceId: wallet.id,
          status: 'pending',
          changes: {
            amount: dto.amount,
            reason: dto.reason,
            reference: dto.reference,
            currentBalance: wallet.balance.toString(),
          },
          ipAddress,
          userAgent,
        },
      });

      return {
        success: true,
        requiresApproval: true,
        actionId: pendingAction.id,
        message: `Debit request for ₦${dto.amount.toLocaleString()} requires approval`,
      };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.digitalWallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: dto.amount,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          adminUserId,
          userId: dto.userId,
          action: 'wallet_debited',
          resource: 'wallet',
          resourceId: wallet.id,
          status: 'success',
          changes: {
            amount: dto.amount,
            reason: dto.reason,
            reference: dto.reference,
            previousBalance: wallet.balance.toString(),
            newBalance: updatedWallet.balance.toString(),
          },
          ipAddress,
          userAgent,
        },
      });

      return updatedWallet;
    });

    return {
      success: true,
      requiresApproval: false,
      wallet: {
        id: result.id,
        previousBalance: wallet.balance,
        newBalance: result.balance,
        debited: dto.amount,
      },
      message: `Successfully debited ₦${dto.amount.toLocaleString()} from user's wallet`,
    };
  }

  async approvePendingAction(
    approverId: string,
    actionId: string,
    notes: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const approver = await this.prisma.adminUser.findUnique({
      where: { id: approverId },
      include: { role: true },
    });

    if (!approver) {
      throw new NotFoundException('Approver not found');
    }

    const pendingAction = await this.prisma.auditLog.findUnique({
      where: { id: actionId },
    });

    if (!pendingAction) {
      throw new NotFoundException('Pending action not found');
    }

    if (pendingAction.status !== 'pending') {
      throw new BadRequestException('Action already processed');
    }

    // Check if approver has sufficient permissions
    const requiredRoles = ['super_admin', 'finance'];
    if (!requiredRoles.includes(approver.role.name)) {
      throw new ForbiddenException('Insufficient permissions to approve this action');
    }

    const changes = pendingAction.changes as any;
    const isCredit = pendingAction.action === 'wallet_credit_pending';

    const result = await this.prisma.$transaction(async (tx) => {
      // Update wallet
      const wallet = await tx.digitalWallet.update({
        where: { id: pendingAction.resourceId },
        data: {
          balance: {
            [isCredit ? 'increment' : 'decrement']: changes.amount,
          },
        },
      });

      // Update pending action
      await tx.auditLog.update({
        where: { id: actionId },
        data: {
          status: 'approved',
          changes: {
            ...changes,
            approvedBy: approverId,
            approvedAt: new Date().toISOString(),
            approverNotes: notes,
            newBalance: wallet.balance.toString(),
          },
        },
      });

      // Create approval audit log
      await tx.auditLog.create({
        data: {
          adminUserId: approverId,
          userId: pendingAction.userId,
          action: isCredit ? 'wallet_credited' : 'wallet_debited',
          resource: 'wallet',
          resourceId: wallet.id,
          status: 'success',
          changes: {
            amount: changes.amount,
            reason: changes.reason,
            reference: changes.reference,
            previousBalance: changes.currentBalance,
            newBalance: wallet.balance.toString(),
            approvedFrom: actionId,
            approverNotes: notes,
          },
          ipAddress,
          userAgent,
        },
      });

      return wallet;
    });

    return {
      success: true,
      message: `Action approved and wallet ${isCredit ? 'credited' : 'debited'} successfully`,
      wallet: result,
    };
  }

  async rejectPendingAction(
    approverId: string,
    actionId: string,
    reason: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const approver = await this.prisma.adminUser.findUnique({
      where: { id: approverId },
      include: { role: true },
    });

    if (!approver) {
      throw new NotFoundException('Approver not found');
    }

    const pendingAction = await this.prisma.auditLog.findUnique({
      where: { id: actionId },
    });

    if (!pendingAction) {
      throw new NotFoundException('Pending action not found');
    }

    if (pendingAction.status !== 'pending') {
      throw new BadRequestException('Action already processed');
    }

    const requiredRoles = ['super_admin', 'finance'];
    if (!requiredRoles.includes(approver.role.name)) {
      throw new ForbiddenException('Insufficient permissions to reject this action');
    }

    await this.prisma.auditLog.update({
      where: { id: actionId },
      data: {
        status: 'rejected',
        changes: {
          ...(pendingAction.changes as any),
          rejectedBy: approverId,
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason,
        },
      },
    });

    return {
      success: true,
      message: 'Action rejected successfully',
    };
  }

  async getPendingActions(adminUserId: string) {
    const adminUser = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
      include: { role: true },
    });

    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    const pendingActions = await this.prisma.auditLog.findMany({
      where: {
        action: {
          in: ['wallet_credit_pending', 'wallet_debit_pending'],
        },
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        admin: {
          select: {
            id: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pendingActions;
  }

  async getWalletAuditLog(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          userId,
          resource: 'wallet',
        },
        include: {
          admin: {
            select: {
              id: true,
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({
        where: {
          userId,
          resource: 'wallet',
        },
      }),
    ]);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserWallet(userId: string) {
    const wallet = await this.prisma.digitalWallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }
}
