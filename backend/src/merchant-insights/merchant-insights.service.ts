import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MerchantInsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllInsights(merchantId: string) {
    // Generate fresh insights and persist them
    const generated = [
      ...(await this.generateDemandInsights(merchantId)),
      ...(await this.generatePricingInsights(merchantId)),
      ...(await this.generateMenuInsights(merchantId)),
    ];

    // Upsert each insight into the persisted table
    for (const insight of generated) {
      await this.prisma.merchantAiInsight.upsert({
        where: { id: insight.id },
        create: {
          id: insight.id,
          businessId: merchantId,
          insightType: insight.type,
          insightData: { title: insight.title, description: insight.description, impact: insight.impact },
          confidenceScore: insight.confidence,
          potentialImpact: insight.potentialImpact || null,
        },
        update: {
          insightData: { title: insight.title, description: insight.description, impact: insight.impact },
          confidenceScore: insight.confidence,
        },
      });
    }

    // Return all non-dismissed insights from DB
    const persisted = await this.prisma.merchantAiInsight.findMany({
      where: { businessId: merchantId, dismissed: false },
      orderBy: { createdAt: 'desc' },
    });

    return persisted.map((i) => ({
      id: i.id,
      type: i.insightType,
      title: (i.insightData as any)?.title || '',
      description: (i.insightData as any)?.description || '',
      impact: (i.insightData as any)?.impact || 'medium',
      confidence: i.confidenceScore,
      implemented: i.implemented,
    }));
  }

  private async generateDemandInsights(merchantId: string) {
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
      potentialImpact: orderCount * 50,
    }];
  }

  private async generatePricingInsights(merchantId: string) {
    return [{
      id: `pricing-${merchantId}`,
      type: 'pricing',
      title: 'Pricing Optimization',
      description: 'Review your menu pricing to stay competitive.',
      impact: 'medium',
      confidence: 0.75,
      potentialImpact: null,
    }];
  }

  private async generateMenuInsights(merchantId: string) {
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
      potentialImpact: null,
    }];
  }

  async getDemandForecast(merchantId: string) {
    return this.generateDemandInsights(merchantId);
  }

  async getPricingOptimization(merchantId: string) {
    return this.generatePricingInsights(merchantId);
  }

  async getMenuOptimization(merchantId: string) {
    return this.generateMenuInsights(merchantId);
  }

  async implementInsight(merchantId: string, insightId: string) {
    // Update persisted insight
    await this.prisma.merchantAiInsight.updateMany({
      where: { id: insightId, businessId: merchantId },
      data: { implemented: true },
    });
    // Also keep backward-compat action record
    await this.prisma.merchantInsightAction.upsert({
      where: { merchantId_insightId: { merchantId, insightId } },
      create: { merchantId, insightId, action: 'implemented' },
      update: { action: 'implemented' },
    });
    return { message: 'Insight implemented', id: insightId };
  }

  async dismissInsight(merchantId: string, insightId: string) {
    await this.prisma.merchantAiInsight.updateMany({
      where: { id: insightId, businessId: merchantId },
      data: { dismissed: true },
    });
    await this.prisma.merchantInsightAction.upsert({
      where: { merchantId_insightId: { merchantId, insightId } },
      create: { merchantId, insightId, action: 'dismissed' },
      update: { action: 'dismissed' },
    });
    return { message: 'Insight dismissed', id: insightId };
  }
}
