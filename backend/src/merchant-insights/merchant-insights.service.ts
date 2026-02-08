import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MerchantInsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllInsights(merchantId: string) {
    return [
      ...(await this.getDemandForecast(merchantId)),
      ...(await this.getPricingOptimization(merchantId)),
      ...(await this.getMenuOptimization(merchantId)),
    ];
  }

  async getDemandForecast(merchantId: string) {
    const orderCount = await this.prisma.order.count({
      where: { businessId: merchantId, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    });

    return [{
      id: `demand-${merchantId}`,
      type: 'demand',
      title: 'Weekly Demand Forecast',
      description: `You had ${orderCount} orders this week.`,
      impact: 'medium',
      confidence: 0.8,
    }];
  }

  async getPricingOptimization(merchantId: string) {
    return [{
      id: `pricing-${merchantId}`,
      type: 'pricing',
      title: 'Pricing Optimization',
      description: 'Review your menu pricing to stay competitive.',
      impact: 'medium',
      confidence: 0.75,
    }];
  }

  async getMenuOptimization(merchantId: string) {
    const items = await this.prisma.menuItem.findMany({
      where: { category: { businessId: merchantId } },
      select: { id: true, name: true },
      take: 5,
    });

    return [{
      id: `menu-${merchantId}`,
      type: 'menu',
      title: 'Menu Optimization',
      description: `You have ${items.length} menu items. Consider adding more variety.`,
      impact: 'low',
      confidence: 0.7,
    }];
  }

  async implementInsight(merchantId: string, insightId: string) {
    return { message: 'Insight implemented', id: insightId };
  }

  async dismissInsight(merchantId: string, insightId: string) {
    return { message: 'Insight dismissed', id: insightId };
  }
}
