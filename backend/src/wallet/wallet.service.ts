import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomInt } from 'crypto';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

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
      include: { wallet: true },
    });

    if (!request) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (request.userId !== userId) {
      throw new BadRequestException('This withdrawal request does not belong to you');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException(`Request already ${request.status}`);
    }

    if (!request.confirmationCode || request.confirmationCode !== code) {
      throw new BadRequestException('Invalid confirmation code');
    }

    if (!request.codeExpiresAt || new Date() > request.codeExpiresAt) {
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
    await this.prisma.withdrawalRequest.update({
      where: { id: requestId },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    // Deduct from wallet (move to pending)
    await this.prisma.digitalWallet.update({
      where: { id: request.walletId },
      data: {
        balance: {
          decrement: request.amount,
        },
        pendingBalance: {
          increment: request.amount,
        },
      },
    });

    // TODO: Process actual withdrawal with payment provider
    // For now, we'll simulate immediate processing
    await this.processWithdrawal(requestId);

    return {
      success: true,
      amount: Number(request.amount),
      message: 'Withdrawal confirmed and processing',
    };
  }

  private async processWithdrawal(requestId: string) {
    // Simulate payment processing
    setTimeout(async () => {
      const request = await this.prisma.withdrawalRequest.findUnique({
        where: { id: requestId },
      });

      if (request && request.status === 'confirmed') {
        await this.prisma.withdrawalRequest.update({
          where: { id: requestId },
          data: {
            status: 'completed',
            processedAt: new Date(),
          },
        });

        // Move from pending to completed (remove from pending)
        await this.prisma.digitalWallet.update({
          where: { id: request.walletId },
          data: {
            pendingBalance: {
              decrement: request.amount,
            },
          },
        });

        console.log(`[WITHDRAWAL] Completed withdrawal ${requestId}`);
      }
    }, 2000); // Simulate 2-second processing
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
