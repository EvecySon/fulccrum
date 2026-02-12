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
        business: { select: { businessName: true, logoUrl: true, rating: true } },
        items: { include: { menuItem: true } },
      },
    });

    // Build recommendations from order history
    const recommendations = recentOrders.slice(0, limit).map((order, i) => ({
      id: `rec-${order.id}`,
      type: i === 0 ? 'reorder' : 'meal',
      title: order.items?.[0]?.menuItem?.name || 'Recommended Item',
      subtitle: order.business?.businessName || 'Restaurant',
      image: (order.items?.[0]?.menuItem as any)?.images?.[0] || '',
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
      predictedItems: topOrder.items?.map((i: any) => i.menuItem?.name).filter(Boolean) || [],
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
    // audioUri is actually the transcript text from the frontend
    const text = (audioUri || '').toLowerCase().trim();

    if (!text) {
      return {
        intent: 'unknown',
        confidence: 0.3,
        parsedItems: [],
        suggestedAction: 'Please say or type what you would like to order.',
        rawText: '',
      };
    }

    // Determine intent
    let intent = 'order';
    if (text.includes('reorder') || text.includes('last meal') || text.includes('again')) {
      intent = 'reorder';
    } else if (text.includes('find') || text.includes('search') || text.includes('where')) {
      intent = 'search';
    } else if (text.includes('trending') || text.includes('popular') || text.includes('recommend')) {
      intent = 'discover';
    } else if (text.includes('cancel')) {
      intent = 'cancel';
    } else if (text.includes('track') || text.includes('status') || text.includes('where is')) {
      intent = 'track';
    }

    // Extract restaurant name (after "from")
    let restaurant: string | undefined;
    const fromMatch = text.match(/from\s+(.+?)(?:\s*$|\s+and\s|\s+with\s)/i);
    if (fromMatch) {
      restaurant = fromMatch[1].replace(/['"]/g, '').trim();
      // Capitalize each word
      restaurant = restaurant.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    } else {
      const fromEnd = text.match(/from\s+(.+)$/i);
      if (fromEnd) {
        restaurant = fromEnd[1].replace(/['"]/g, '').trim();
        restaurant = restaurant.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }

    // Extract food items — remove common filler words
    const fillers = ['order', 'get', 'me', 'i', 'want', 'some', 'a', 'an', 'the', 'please', 'can', 'you', 'give', 'bring', 'need', 'would', 'like', 'of', 'with'];
    let itemsText = text;
    // Remove "from <restaurant>" part
    if (restaurant) {
      itemsText = itemsText.replace(/from\s+.+$/i, '').trim();
    }
    // Split by "and", commas
    const rawItems = itemsText.split(/\s+and\s+|,\s*/).map(s => s.trim()).filter(Boolean);
    const parsedItems = rawItems.map(item => {
      const words = item.split(/\s+/).filter(w => !fillers.includes(w.toLowerCase()));
      return words.join(' ');
    }).filter(item => item.length > 1).map(item =>
      item.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    );

    // Build suggestion
    let suggestedAction = '';
    if (intent === 'reorder') {
      suggestedAction = 'Reordering your last meal...';
    } else if (intent === 'search') {
      suggestedAction = `Searching for ${parsedItems.length > 0 ? parsedItems.join(', ') : 'restaurants'}...`;
    } else if (intent === 'discover') {
      suggestedAction = 'Showing trending items near you...';
    } else if (parsedItems.length > 0 && restaurant) {
      suggestedAction = `Order ${parsedItems.join(', ')} from ${restaurant}`;
    } else if (parsedItems.length > 0) {
      suggestedAction = `Search for ${parsedItems.join(', ')} nearby`;
    } else {
      suggestedAction = 'Browse the menu to find what you want.';
    }

    return {
      intent,
      confidence: parsedItems.length > 0 ? 0.92 : 0.7,
      parsedItems,
      restaurant,
      suggestedAction,
      rawText: audioUri,
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
