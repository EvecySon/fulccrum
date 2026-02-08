import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendations(userId: string, limit: number) {
    // Fetch user's recent orders to build recommendations
    const recentOrders = await this.prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        business: { select: { businessName: true, logoUrl: true, cuisine: true, rating: true } },
        items: { include: { menuItem: true } },
      },
    });

    // Build recommendations from order history
    const recommendations = recentOrders.slice(0, limit).map((order, i) => ({
      id: `rec-${order.id}`,
      type: i === 0 ? 'reorder' : 'meal',
      title: order.items?.[0]?.menuItem?.name || 'Recommended Item',
      subtitle: order.business?.businessName || 'Restaurant',
      image: order.items?.[0]?.menuItem?.imageUrl || '',
      confidence: Math.round((0.95 - i * 0.03) * 100) / 100,
      price: order.totalAmount,
      reason: i === 0 ? 'Your most recent order' : `Based on your order history`,
    }));

    return recommendations;
  }

  async getPredictiveOrders(userId: string) {
    const recentOrders = await this.prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        business: { select: { businessName: true } },
        items: { include: { menuItem: { select: { name: true } } } },
      },
    });

    if (!recentOrders.length) {
      return { nextOrderTime: null, predictedItems: [], predictedRestaurant: null, confidence: 0 };
    }

    const topOrder = recentOrders[0];
    return {
      nextOrderTime: new Date(Date.now() + 4 * 3600000).toISOString(),
      predictedItems: topOrder.items?.map(i => i.menuItem?.name).filter(Boolean) || [],
      predictedRestaurant: topOrder.business?.businessName || null,
      confidence: 0.85,
    };
  }

  async getVoiceProfile(userId: string) {
    return {
      userId,
      enabled: false,
      preferredLanguage: 'en',
      voiceId: null,
    };
  }

  async processVoiceCommand(userId: string, audioUri: string) {
    return {
      intent: 'order',
      confidence: 0.9,
      parsedItems: [],
      suggestedAction: 'Please type your order or browse the menu.',
      rawText: '',
    };
  }

  async getBehaviorAnalysis(userId: string) {
    const orderCount = await this.prisma.order.count({ where: { customerId: userId } });
    return {
      userId,
      totalOrders: orderCount,
      averageOrderFrequency: orderCount > 0 ? 'weekly' : 'none',
      preferredCuisines: [],
      peakOrderTimes: [],
      averageSpend: 0,
    };
  }

  async dismissRecommendation(userId: string, recommendationId: string) {
    return { message: 'Recommendation dismissed', id: recommendationId };
  }

  async acceptRecommendation(userId: string, recommendationId: string) {
    return { message: 'Recommendation accepted', id: recommendationId };
  }
}
