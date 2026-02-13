import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReferralService {
  constructor(private prisma: PrismaService) {}

  async getReferralInfo(courierId: string, email: string) {
    const code = `${email.split('@')[0].toUpperCase()}${new Date().getFullYear()}`;
    
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: courierId },
      include: {
        referred: {
          select: {
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
      },
    });

    const totalReferred = referrals.length;
    const totalEarned = referrals
      .filter(r => r.paidOut)
      .reduce((sum, r) => sum + r.rewardAmount, 0);
    const pendingEarnings = referrals
      .filter(r => r.status === 'completed' && !r.paidOut)
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    const referralHistory = referrals.map(r => ({
      id: r.id,
      name: `${r.referred.firstName} ${r.referred.lastName.charAt(0)}.`,
      date: r.createdAt.toISOString().split('T')[0],
      status: r.status,
      deliveries: r.deliveriesCompleted,
      requiredDeliveries: r.deliveriesRequired,
      earned: r.paidOut ? r.rewardAmount : 0,
    }));

    return {
      code,
      link: `https://fulccrum.com/join?ref=${code}`,
      totalReferred,
      totalEarned,
      pendingEarnings,
      referrals: referralHistory,
    };
  }

  async getReferralHistory(courierId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: courierId },
      include: {
        referred: {
          select: {
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return referrals.map(r => ({
      id: r.id,
      name: `${r.referred.firstName} ${r.referred.lastName.charAt(0)}.`,
      date: r.createdAt.toISOString().split('T')[0],
      status: r.status,
      deliveries: r.deliveriesCompleted,
      requiredDeliveries: r.deliveriesRequired,
      earned: r.paidOut ? r.rewardAmount : 0,
    }));
  }

  async applyReferralCode(courierId: string, code: string) {
    // Find referrer by code pattern
    const year = new Date().getFullYear().toString();
    if (!code.endsWith(year)) {
      throw new Error('Invalid referral code');
    }

    const emailPrefix = code.slice(0, -4).toLowerCase();
    
    const referrer = await this.prisma.user.findFirst({
      where: {
        email: { startsWith: emailPrefix },
        role: 'driver',
      },
    });

    if (!referrer) {
      throw new Error('Referrer not found');
    }

    if (referrer.id === courierId) {
      throw new Error('Cannot refer yourself');
    }

    const existing = await this.prisma.referral.findFirst({
      where: { referredId: courierId },
    });

    if (existing) {
      throw new Error('You have already used a referral code');
    }

    await this.prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: courierId,
        status: 'pending',
      },
    });

    return { message: 'Referral code applied successfully' };
  }
}
