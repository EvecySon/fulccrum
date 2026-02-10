import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MerchantPricingService {
  constructor(private readonly prisma: PrismaService) {}

  async getRules(merchantId: string) {
    return this.prisma.pricingRule.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRule(merchantId: string, data: any) {
    return this.prisma.pricingRule.create({
      data: {
        merchantId,
        name: data.name || 'New Rule',
        type: data.type || 'surge',
        condition: data.condition || null,
        adjustment: parseFloat(data.adjustment) || 0,
        adjustmentType: data.adjustmentType || 'percentage',
        active: true,
      },
    });
  }

  async updateRule(merchantId: string, id: string, data: any) {
    const result = await this.prisma.pricingRule.updateMany({
      where: { id, merchantId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.condition !== undefined && { condition: data.condition }),
        ...(data.adjustment !== undefined && { adjustment: parseFloat(data.adjustment) }),
        ...(data.adjustmentType && { adjustmentType: data.adjustmentType }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
    if (result.count === 0) throw new NotFoundException('Rule not found');
    return { message: 'Rule updated', id };
  }

  async deleteRule(merchantId: string, id: string) {
    const result = await this.prisma.pricingRule.deleteMany({
      where: { id, merchantId },
    });
    if (result.count === 0) throw new NotFoundException('Rule not found');
    return { message: 'Rule deleted', id };
  }

  async toggleRule(merchantId: string, id: string) {
    const rule = await this.prisma.pricingRule.findFirst({ where: { id, merchantId } });
    if (!rule) throw new NotFoundException('Rule not found');
    await this.prisma.pricingRule.update({
      where: { id },
      data: { active: !rule.active },
    });
    return { message: 'Rule toggled', id, active: !rule.active };
  }

  async getPreview(merchantId: string, id: string) {
    const rule = await this.prisma.pricingRule.findFirst({ where: { id, merchantId } });
    if (!rule) throw new NotFoundException('Rule not found');

    const itemCount = await this.prisma.menuItem.count({
      where: { category: { businessId: merchantId } },
    });

    return {
      ruleId: id,
      affectedItems: itemCount,
      estimatedRevenueChange: rule.adjustment,
      rule,
    };
  }
}
