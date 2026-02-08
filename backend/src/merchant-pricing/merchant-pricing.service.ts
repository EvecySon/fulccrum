import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MerchantPricingService {
  constructor(private readonly prisma: PrismaService) {}

  async getRules(merchantId: string) {
    return [];
  }

  async createRule(merchantId: string, data: any) {
    return { id: `rule-${Date.now()}`, ...data, merchantId, enabled: true, createdAt: new Date() };
  }

  async updateRule(merchantId: string, id: string, data: any) {
    return { message: 'Rule updated', id, ...data };
  }

  async deleteRule(merchantId: string, id: string) {
    return { message: 'Rule deleted', id };
  }

  async toggleRule(merchantId: string, id: string) {
    return { message: 'Rule toggled', id };
  }

  async getPreview(merchantId: string, id: string) {
    return {
      ruleId: id,
      affectedItems: 0,
      estimatedRevenueChange: 0,
      preview: [],
    };
  }
}
