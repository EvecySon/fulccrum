import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CampaignService {
  constructor(private prisma: PrismaService) {}

  // Campaign Management
  async createCampaign(data: {
    name: string;
    type: string;
    startDate: Date;
    endDate?: Date;
    budget?: number;
    targetAudience: any;
    config: any;
    createdBy: string;
  }) {
    return this.prisma.campaign.create({
      data: {
        name: data.name,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget ? new Prisma.Decimal(data.budget) : null,
        targetAudience: data.targetAudience,
        config: data.config,
        createdBy: data.createdBy,
        status: 'draft',
      },
    });
  }

  async getCampaigns(filters?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data: campaigns,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateCampaign(campaignId: string, data: Partial<{
    name: string;
    status: string;
    endDate: Date;
    budget: number;
    targetAudience: any;
    config: any;
  }>) {
    const updateData: any = { ...data };
    if (data.budget !== undefined) {
      updateData.budget = data.budget ? new Prisma.Decimal(data.budget) : null;
    }

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
    });
  }

  async launchCampaign(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new BadRequestException('Campaign cannot be launched');
    }

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'active' },
    });
  }

  async pauseCampaign(campaignId: string) {
    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'paused' },
    });
  }

  async updateCampaignMetrics(campaignId: string, metrics: any) {
    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: { metrics },
    });
  }

  // Promo Code Management
  async createPromoCode(data: {
    code: string;
    type: string;
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    validFrom: Date;
    validUntil: Date;
    applicableTo?: any;
    createdBy: string;
  }) {
    const existing = await this.prisma.promoCode.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new BadRequestException('Promo code already exists');
    }

    return this.prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: new Prisma.Decimal(data.value),
        minOrderValue: data.minOrderValue ? new Prisma.Decimal(data.minOrderValue) : null,
        maxDiscount: data.maxDiscount ? new Prisma.Decimal(data.maxDiscount) : null,
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit || 1,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        applicableTo: data.applicableTo,
        createdBy: data.createdBy,
      },
    });
  }

  async getPromoCodes(filters?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const [codes, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.promoCode.count({ where }),
    ]);

    return {
      data: codes,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updatePromoCode(codeId: string, data: Partial<{
    isActive: boolean;
    usageLimit: number;
    validUntil: Date;
  }>) {
    return this.prisma.promoCode.update({
      where: { id: codeId },
      data,
    });
  }

  async validatePromoCode(code: string, userId: string, orderAmount: number) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) return { valid: false, reason: 'Invalid promo code' };
    if (!promo.isActive) return { valid: false, reason: 'Promo code is inactive' };

    const now = new Date();
    if (now < promo.validFrom) return { valid: false, reason: 'Promo code not yet valid' };
    if (now > promo.validUntil) return { valid: false, reason: 'Promo code has expired' };

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return { valid: false, reason: 'Promo code usage limit reached' };
    }

    if (promo.minOrderValue && new Prisma.Decimal(orderAmount).lt(promo.minOrderValue)) {
      return { valid: false, reason: `Minimum order value is ₦${promo.minOrderValue}` };
    }

    // Check per-user limit (would need PromoUsage tracking)
    // For now, simplified validation

    let discount = new Prisma.Decimal(0);
    if (promo.type === 'percentage') {
      discount = new Prisma.Decimal(orderAmount).mul(promo.value).div(100);
      if (promo.maxDiscount && discount.gt(promo.maxDiscount)) {
        discount = promo.maxDiscount;
      }
    } else if (promo.type === 'fixed_amount') {
      discount = promo.value;
    } else if (promo.type === 'free_delivery') {
      // Handle in order calculation
      discount = new Prisma.Decimal(0);
    }

    return {
      valid: true,
      discount: discount.toNumber(),
      type: promo.type,
      code: promo.code,
    };
  }

  async getCampaignAnalytics(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return {
      campaign,
      metrics: campaign.metrics || {},
      spent: campaign.spent.toNumber(),
      budget: campaign.budget?.toNumber(),
      roi: this.calculateROI(campaign),
    };
  }

  private calculateROI(campaign: any): number {
    const metrics = campaign.metrics || {};
    const revenue = metrics.revenue || 0;
    const spent = campaign.spent.toNumber();
    
    if (spent === 0) return 0;
    return ((revenue - spent) / spent) * 100;
  }
}
