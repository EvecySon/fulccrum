import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourierGamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAchievements(courierId: string) {
    const deliveryCount = await this.prisma.order.count({
      where: { driverId: courierId, status: 'delivered' },
    });

    return [
      { id: 'first-delivery', title: 'First Delivery', description: 'Complete your first delivery', progress: Math.min(deliveryCount, 1), target: 1, reward: 500, claimed: deliveryCount >= 1 },
      { id: '10-deliveries', title: 'Getting Started', description: 'Complete 10 deliveries', progress: Math.min(deliveryCount, 10), target: 10, reward: 2000, claimed: false },
      { id: '50-deliveries', title: 'Road Warrior', description: 'Complete 50 deliveries', progress: Math.min(deliveryCount, 50), target: 50, reward: 5000, claimed: false },
      { id: '100-deliveries', title: 'Century Club', description: 'Complete 100 deliveries', progress: Math.min(deliveryCount, 100), target: 100, reward: 10000, claimed: false },
    ];
  }

  async getTiers(courierId: string) {
    const deliveryCount = await this.prisma.order.count({
      where: { driverId: courierId, status: 'delivered' },
    });

    const tiers = [
      { name: 'Bronze', minDeliveries: 0, perks: ['Standard pay rate'], color: '#CD7F32' },
      { name: 'Silver', minDeliveries: 50, perks: ['1.2x pay multiplier', 'Priority dispatch'], color: '#C0C0C0' },
      { name: 'Gold', minDeliveries: 200, perks: ['1.5x pay multiplier', 'Priority dispatch', 'Bonus zones'], color: '#FFD700' },
      { name: 'Platinum', minDeliveries: 500, perks: ['2x pay multiplier', 'Priority dispatch', 'Bonus zones', 'VIP support'], color: '#E5E4E2' },
    ];

    const currentTier = [...tiers].reverse().find(t => deliveryCount >= t.minDeliveries) || tiers[0];

    return { currentTier: currentTier.name, totalDeliveries: deliveryCount, tiers };
  }

  async getLeaderboard(courierId: string, period?: string) {
    const drivers = await this.prisma.user.findMany({
      where: { role: 'driver' },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      take: 20,
    });

    const leaderboard = await Promise.all(
      drivers.map(async (d, i) => {
        const count = await this.prisma.order.count({
          where: { driverId: d.id, status: 'delivered' },
        });
        return {
          rank: i + 1,
          userId: d.id,
          name: `${d.firstName || ''} ${d.lastName || ''}`.trim(),
          avatar: d.avatarUrl,
          deliveries: count,
          isCurrentUser: d.id === courierId,
        };
      }),
    );

    leaderboard.sort((a, b) => b.deliveries - a.deliveries);
    leaderboard.forEach((entry, i) => (entry.rank = i + 1));

    return leaderboard;
  }

  async claimReward(courierId: string, achievementId: string) {
    return { message: 'Reward claimed', achievementId };
  }
}
