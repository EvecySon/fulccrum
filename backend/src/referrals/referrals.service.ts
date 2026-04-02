import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async getMyStats(userId: string) {
    // Get user's stored referral code
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    const referralCode = user?.referralCode || '';

    // Get referral statistics
    const referralsGiven = await this.prisma.referral.findMany({
      where: { referrerId: userId },
    });

    const totalReferrals = referralsGiven.length;
    const activeReferrals = referralsGiven.filter(
      (r) => r.status === 'active' || r.status === 'completed',
    ).length;

    const totalEarnings = referralsGiven
      .filter((r) => r.paidOut)
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    const pendingEarnings = referralsGiven
      .filter((r) => !r.paidOut && r.status === 'completed')
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    return {
      referralCode,
      stats: {
        totalReferrals,
        activeReferrals,
        totalEarnings,
        pendingEarnings,
      },
    };
  }

  async getHistory(userId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return referrals.map((r) => ({
      id: r.id,
      name: `${r.referred.firstName} ${r.referred.lastName}`,
      email: r.referred.email,
      joinedDate: r.createdAt,
      status: r.status,
      deliveriesCompleted: r.deliveriesCompleted,
      deliveriesRequired: r.deliveriesRequired,
      rewardAmount: r.rewardAmount,
      paidOut: r.paidOut,
    }));
  }
}
