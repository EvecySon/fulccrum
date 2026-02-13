import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuestService {
  constructor(private prisma: PrismaService) {}

  async getActiveQuests(courierId: string) {
    const now = new Date();
    
    const quests = await this.prisma.quest.findMany({
      where: {
        active: true,
        startsAt: { lte: now },
        expiresAt: { gte: now },
      },
      orderBy: { expiresAt: 'asc' },
    });

    const progress = await this.prisma.courierQuestProgress.findMany({
      where: { courierId },
      include: { quest: true },
    });

    const progressMap = new Map(progress.map(p => [p.questId, p]));

    return quests.map(quest => {
      const prog = progressMap.get(quest.id);
      const expiresIn = this.getTimeRemaining(quest.expiresAt);
      
      return {
        id: quest.id,
        type: quest.type,
        title: quest.title,
        description: quest.description,
        icon: quest.icon,
        color: quest.color,
        progress: prog?.progress || 0,
        target: quest.target,
        reward: quest.reward,
        expiresIn,
        completed: prog?.completed || false,
        claimed: prog?.claimed || false,
      };
    });
  }

  async getQuestDetails(courierId: string, questId: string) {
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    const progress = await this.prisma.courierQuestProgress.findUnique({
      where: {
        courierId_questId: { courierId, questId },
      },
    });

    return {
      ...quest,
      progress: progress?.progress || 0,
      completed: progress?.completed || false,
      claimed: progress?.claimed || false,
      expiresIn: this.getTimeRemaining(quest.expiresAt),
    };
  }

  async claimQuestReward(courierId: string, questId: string) {
    const progress = await this.prisma.courierQuestProgress.findUnique({
      where: {
        courierId_questId: { courierId, questId },
      },
      include: { quest: true },
    });

    if (!progress) {
      throw new NotFoundException('Quest progress not found');
    }

    if (!progress.completed) {
      throw new Error('Quest not completed yet');
    }

    if (progress.claimed) {
      throw new Error('Reward already claimed');
    }

    await this.prisma.courierQuestProgress.update({
      where: { id: progress.id },
      data: { claimed: true },
    });

    return {
      message: 'Reward claimed successfully',
      reward: progress.quest.reward,
    };
  }

  async getQuestSummary(courierId: string) {
    const progress = await this.prisma.courierQuestProgress.findMany({
      where: { courierId },
      include: { quest: true },
    });

    const totalEarned = progress
      .filter(p => p.claimed)
      .reduce((sum, p) => sum + p.quest.reward, 0);

    const completedCount = progress.filter(p => p.completed).length;

    const streak = await this.calculateStreak(courierId);

    return {
      totalEarned,
      completedCount,
      streak,
    };
  }

  private getTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    
    return hours > 0 ? `${hours}h left` : `${minutes}m left`;
  }

  private async calculateStreak(courierId: string): Promise<number> {
    return 0;
  }
}
