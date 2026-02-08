import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from '../payment/paystack.service';
import { randomInt } from 'crypto';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private paystackService: PaystackService,
  ) {}

  async getOrCreateWallet(userId: string) {
    let wallet = await this.prisma.digitalWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.digitalWallet.create({
        data: { userId },
      });
    }

    return wallet;
  }

  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    
    return {
      balance: Number(wallet.balance),
      pendingBalance: Number(wallet.pendingBalance),
      frozenBalance: Number(wallet.frozenBalance),
      availableBalance: Number(wallet.balance) - Number(wallet.frozenBalance),
      currency: wallet.currency,
    };
  }

  async addFunds(userId: string, amount: number, description: string) {
    const wallet = await this.getOrCreateWallet(userId);

    const updatedWallet = await this.prisma.digitalWallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    return {
      success: true,
      newBalance: Number(updatedWallet.balance),
      message: `Added ${amount} to wallet`,
    };
  }

  async creditOrderEarnings(
    orderId: string,
    businessId: string,
    driverId: string | null,
    orderTotal: number,
    deliveryFee: number,
  ) {
    const platformSettings = await this.prisma.platformSettings.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const commissionRate = platformSettings?.platformCommissionPercentage.toNumber() || 15;

    const platformCommission = (orderTotal * commissionRate) / 100;
    const businessEarnings = orderTotal - platformCommission;

    const businessWallet = await this.getOrCreateWallet(businessId);
    await this.prisma.digitalWallet.update({
      where: { id: businessWallet.id },
      data: {
        balance: { increment: businessEarnings },
      },
    });

    console.log(`[WALLET] Credited ${businessEarnings} NGN to business ${businessId} for order ${orderId}`);

    if (driverId) {
      const driverWallet = await this.getOrCreateWallet(driverId);
      await this.prisma.digitalWallet.update({
        where: { id: driverWallet.id },
        data: {
          balance: { increment: deliveryFee },
        },
      });

      console.log(`[WALLET] Credited ${deliveryFee} NGN to driver ${driverId} for order ${orderId}`);
    }

    return {
      success: true,
      businessEarnings,
      driverEarnings: driverId ? deliveryFee : 0,
      platformCommission,
    };
  }

  async requestWithdrawal(userId: string, amount: number, ipAddress: string) {
    const wallet = await this.getOrCreateWallet(userId);

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (amount > 10000) {
      throw new BadRequestException('Maximum withdrawal amount is 10,000 per request');
    }

    const availableBalance = Number(wallet.balance) - Number(wallet.frozenBalance);
    if (amount > availableBalance) {
      throw new BadRequestException(`Insufficient balance. Available: ${availableBalance}`);
    }

    // Check for recent withdrawal requests (cooldown: 5 minutes)
    const recentRequest = await this.prisma.withdrawalRequest.findFirst({
      where: {
        userId,
        requestedAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000),
        },
        status: {
          in: ['pending', 'confirmed', 'processing'],
        },
      },
    });

    if (recentRequest) {
      throw new BadRequestException('Please wait 5 minutes between withdrawal requests');
    }

    // Generate 6-digit confirmation code
    const confirmationCode = randomInt(100000, 999999).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const request = await this.prisma.withdrawalRequest.create({
      data: {
        userId,
        walletId: wallet.id,
        amount,
        confirmationCode,
        codeExpiresAt,
        ipAddress,
        status: 'pending',
      },
    });

    // TODO: Send confirmation code via email/SMS
    console.log(`[WITHDRAWAL] Confirmation code for ${userId}: ${confirmationCode}`);

    return {
      requestId: request.id,
      amount: Number(request.amount),
      expiresAt: request.codeExpiresAt,
      message: 'Confirmation code sent to your email. Code expires in 10 minutes.',
    };
  }

  async confirmWithdrawal(userId: string, requestId: string, code: string) {
    const request = await this.prisma.withdrawalRequest.findUnique({
      where: { id: requestId },
      include: {
        wallet: true,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        bankAccounts: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (request.userId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Request already processed');
    }

    if (request.confirmationCode !== code) {
      throw new BadRequestException('Invalid confirmation code');
    }

    if (request.codeExpiresAt && request.codeExpiresAt < new Date()) {
      await this.prisma.withdrawalRequest.update({
        where: { id: requestId },
        data: { status: 'expired' },
      });
      throw new BadRequestException('Confirmation code expired');
    }

    // Check balance again
    const availableBalance = Number(request.wallet.balance) - Number(request.wallet.frozenBalance);
    if (Number(request.amount) > availableBalance) {
      throw new BadRequestException('Insufficient balance');
    }

    // Update request status
    const defaultAccount = user?.bankAccounts.find((a: any) => a.isDefault);
    if (!defaultAccount) {
      throw new BadRequestException('No default bank account found');
    }

    await this.prisma.withdrawalRequest.update({
      where: { id: requestId },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    try {
      const recipient = await this.paystackService.createTransferRecipient({
        type: 'nuban',
        name: defaultAccount.accountName,
        account_number: defaultAccount.accountNumber,
        bank_code: defaultAccount.bankCode,
        currency: 'NGN',
      });

      const transfer = await this.paystackService.initiateTransfer({
        amount: Number(request.amount) * 100,
        recipient: recipient.recipient_code,
        reason: `Withdrawal for ${user?.email}`,
        reference: `WD-${requestId.substring(0, 8)}-${Date.now()}`,
      });

      await this.prisma.withdrawalRequest.update({
        where: { id: requestId },
        data: {
          status: 'processing',
          processedAt: new Date(),
        },
      });

      await this.prisma.digitalWallet.update({
        where: { id: request.walletId },
        data: {
          balance: {
            decrement: request.amount,
          },
        },
      });

      console.log(`[WITHDRAWAL] Initiated Paystack transfer of ₦${request.amount} for user ${userId}`);
      console.log(`[WITHDRAWAL] Transfer reference: ${transfer.reference}`);

      return {
        success: true,
        message: 'Withdrawal is being processed',
        reference: transfer.reference,
      };
    } catch (error) {
      await this.prisma.withdrawalRequest.update({
        where: { id: requestId },
        data: {
          status: 'failed',
          failedReason: error instanceof Error ? error.message : 'Transfer failed',
        },
      });

      throw new BadRequestException('Withdrawal failed. Please try again or contact support.');
    }
  }

  async getWithdrawalHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.prisma.withdrawalRequest.findMany({
        where: { userId },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          amount: true,
          status: true,
          requestedAt: true,
          confirmedAt: true,
          processedAt: true,
        },
      }),
      this.prisma.withdrawalRequest.count({ where: { userId } }),
    ]);

    return {
      data: requests.map(r => ({
        ...r,
        amount: Number(r.amount),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addBankAccount(
    userId: string,
    accountName: string,
    accountNumber: string,
    bankCode: string,
    bankName: string,
  ) {
    const existing = await this.prisma.bankAccount.findFirst({
      where: {
        userId,
        accountNumber,
      },
    });

    if (existing) {
      throw new BadRequestException('Bank account already exists');
    }

    const isFirst = (await this.prisma.bankAccount.count({ where: { userId } })) === 0;

    return this.prisma.bankAccount.create({
      data: {
        userId,
        accountName,
        accountNumber,
        bankCode,
        bankName,
        isDefault: isFirst,
      },
    });
  }

  async getBankAccounts(userId: string) {
    return this.prisma.bankAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setDefaultBankAccount(userId: string, accountId: string) {
    const account = await this.prisma.bankAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== userId) {
      throw new NotFoundException('Bank account not found');
    }

    await this.prisma.bankAccount.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return this.prisma.bankAccount.update({
      where: { id: accountId },
      data: { isDefault: true },
    });
  }

  async deleteBankAccount(userId: string, accountId: string) {
    const account = await this.prisma.bankAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== userId) {
      throw new NotFoundException('Bank account not found');
    }

    await this.prisma.bankAccount.delete({
      where: { id: accountId },
    });

    if (account.isDefault) {
      const firstAccount = await this.prisma.bankAccount.findFirst({
        where: { userId },
      });

      if (firstAccount) {
        await this.prisma.bankAccount.update({
          where: { id: firstAccount.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true, message: 'Bank account deleted' };
  }

  async cancelWithdrawalRequest(userId: string, requestId: string) {
    const request = await this.prisma.withdrawalRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (request.userId !== userId) {
      throw new BadRequestException('This withdrawal request does not belong to you');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Can only cancel pending requests');
    }

    await this.prisma.withdrawalRequest.update({
      where: { id: requestId },
      data: { status: 'cancelled' },
    });

    return {
      success: true,
      message: 'Withdrawal request cancelled',
    };
  }

}
