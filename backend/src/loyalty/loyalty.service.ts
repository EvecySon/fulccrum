import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const TIERS = [
  { name: 'Bronze', minPoints: 0 },
  { name: 'Silver', minPoints: 1000 },
  { name: 'Gold', minPoints: 3000 },
  { name: 'Platinum', minPoints: 7000 },
];

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  private computeTier(lifetimePoints: number): string {
    let tier = 'Bronze';
    for (const t of TIERS) {
      if (lifetimePoints >= t.minPoints) tier = t.name;
    }
    return tier;
  }

  async getOrCreateLoyalty(userId: string) {
    let loyalty = await this.prisma.customerLoyalty.findUnique({
      where: { userId },
    });

    if (!loyalty) {
      loyalty = await this.prisma.customerLoyalty.create({
        data: { userId },
      });
    }

    return loyalty;
  }

  async getProfile(userId: string) {
    const loyalty = await this.getOrCreateLoyalty(userId);
    const nextTier = TIERS.find(t => t.minPoints > loyalty.lifetimePoints) || TIERS[TIERS.length - 1];

    return {
      ...loyalty,
      tiers: TIERS,
      nextTier: nextTier.name,
      pointsToNextTier: Math.max(0, nextTier.minPoints - loyalty.lifetimePoints),
    };
  }

  async getHistory(userId: string, page = 1, limit = 20) {
    const loyalty = await this.getOrCreateLoyalty(userId);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.loyaltyTransaction.findMany({
        where: { loyaltyId: loyalty.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.loyaltyTransaction.count({
        where: { loyaltyId: loyalty.id },
      }),
    ]);

    return {
      data: transactions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getRewards() {
    return this.prisma.loyaltyReward.findMany({
      where: { active: true },
      orderBy: { pointsCost: 'asc' },
    });
  }

  async redeemReward(userId: string, rewardId: string) {
    const loyalty = await this.getOrCreateLoyalty(userId);

    const reward = await this.prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.active) {
      throw new NotFoundException('Reward not found');
    }

    if (loyalty.points < reward.pointsCost) {
      throw new BadRequestException(`Not enough points. You need ${reward.pointsCost} but have ${loyalty.points}.`);
    }

    // Deduct points and create transaction
    const [updatedLoyalty, transaction] = await this.prisma.$transaction([
      this.prisma.customerLoyalty.update({
        where: { id: loyalty.id },
        data: { points: { decrement: reward.pointsCost } },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          loyaltyId: loyalty.id,
          type: 'redeemed',
          points: -reward.pointsCost,
          description: `Redeemed: ${reward.name}`,
          rewardId: reward.id,
        },
      }),
    ]);

    return {
      success: true,
      transaction,
      remainingPoints: updatedLoyalty.points,
      reward: reward.name,
    };
  }

  async earnPoints(userId: string, points: number, description: string, orderId?: string) {
    const loyalty = await this.getOrCreateLoyalty(userId);

    const newLifetime = loyalty.lifetimePoints + points;
    const newTier = this.computeTier(newLifetime);

    const [updatedLoyalty, transaction] = await this.prisma.$transaction([
      this.prisma.customerLoyalty.update({
        where: { id: loyalty.id },
        data: {
          points: { increment: points },
          lifetimePoints: { increment: points },
          tier: newTier,
        },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          loyaltyId: loyalty.id,
          type: 'earned',
          points,
          description,
          orderId,
        },
      }),
    ]);

    return {
      success: true,
      transaction,
      newPoints: updatedLoyalty.points,
      tier: updatedLoyalty.tier,
      tierChanged: loyalty.tier !== newTier,
    };
  }
}
