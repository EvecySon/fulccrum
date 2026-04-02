import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralTrackingService {
  constructor(private prisma: PrismaService) {}

  async trackOrderCompletion(userId: string) {
    // Find if this user was referred by someone
    const referral = await this.prisma.referral.findFirst({
      where: {
        referredId: userId,
        status: { in: ['pending', 'active'] },
      },
    });

    if (!referral) {
      return; // User wasn't referred or referral already completed
    }

    // Increment deliveries completed
    const updatedReferral = await this.prisma.referral.update({
      where: { id: referral.id },
      data: {
        deliveriesCompleted: { increment: 1 },
        status: referral.status === 'pending' ? 'active' : referral.status,
      },
    });

    // Check if referral conditions are met
    if (
      updatedReferral.deliveriesCompleted >= updatedReferral.deliveriesRequired &&
      !updatedReferral.paidOut
    ) {
      await this.completeReferral(updatedReferral.id, updatedReferral.referrerId);
    }
  }

  private async completeReferral(referralId: string, referrerId: string) {
    // Mark referral as completed and paid out
    const referral = await this.prisma.referral.update({
      where: { id: referralId },
      data: {
        status: 'completed',
        paidOut: true,
      },
      include: {
        referred: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    // Credit the referrer's wallet
    await this.prisma.digitalWallet.upsert({
      where: { userId: referrerId },
      create: {
        userId: referrerId,
        balance: referral.rewardAmount,
      },
      update: {
        balance: { increment: referral.rewardAmount },
      },
    });

    // Create notification for referrer
    try {
      await this.prisma.notification.create({
        data: {
          userId: referrerId,
          title: 'Referral Bonus Earned! 🎉',
          message: `You've earned ₦${referral.rewardAmount.toLocaleString()} for referring ${referral.referred.firstName}!`,
          type: 'promotional',
        },
      });
    } catch (err) {
      console.log('Notification creation failed (non-critical):', err);
    }

    console.log(`Referral reward of ₦${referral.rewardAmount} credited to user ${referrerId}`);
  }
}
