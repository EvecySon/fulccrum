import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { ValidatePromoDto } from './dto/validate-promo.dto';

@Injectable()
export class PromosService {
  constructor(private prisma: PrismaService) {}

  async createPromo(dto: CreatePromoDto) {
    const existingPromo = await this.prisma.promoCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existingPromo) {
      throw new BadRequestException('Promo code already exists');
    }

    if (dto.discountType === 'percentage' && dto.discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    return this.prisma.promoCode.create({
      data: {
        code: dto.code.toUpperCase(),
        type: dto.discountType,
        value: dto.discountValue,
        maxDiscount: dto.maxDiscount,
        minOrderValue: dto.minimumOrder || 0,
        usageLimit: dto.usageLimit,
        perUserLimit: dto.usageLimitPerUser || 1,
        validFrom: new Date(dto.validFrom),
        validUntil: new Date(dto.validUntil),
        applicableTo: dto.applicableTo || {},
        createdBy: 'system',
      },
    });
  }

  async validatePromo(userId: string, dto: ValidatePromoDto) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!promo) {
      throw new BadRequestException('Invalid promo code');
    }

    if (!promo.isActive) {
      throw new BadRequestException('Promo code is not active');
    }

    const now = new Date();
    if (now < promo.validFrom || now > promo.validUntil) {
      throw new BadRequestException('Promo code has expired or is not yet valid');
    }

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    // Note: Per-user usage tracking would require PromoUsage table
    // For now, simplified validation

    if (dto.orderAmount < promo.minOrderValue.toNumber()) {
      throw new BadRequestException(
        `Minimum order amount of ₦${promo.minOrderValue} required for this promo code`,
      );
    }

    // Note: applicableTo is now a JSON field, would need to check structure
    // Simplified for now

    if (promo.applicableTo === 'first_order') {
      const orderCount = await this.prisma.order.count({
        where: {
          customerId: userId,
          status: 'delivered',
        },
      });

      if (orderCount > 0) {
        throw new BadRequestException('This promo code is only valid for first orders');
      }
    }

    const discountAmount = this.calculateDiscount(promo, dto.orderAmount);

    return {
      valid: true,
      promoCode: {
        id: promo.id,
        code: promo.code,
        type: promo.type,
        value: promo.value.toNumber(),
      },
      discountAmount,
      finalAmount: dto.orderAmount - discountAmount,
    };
  }

  async applyPromo(userId: string, promoCodeId: string, orderId: string, orderAmount: number) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { id: promoCodeId },
    });

    if (!promo) {
      throw new BadRequestException('Invalid promo code');
    }

    const discountAmount = this.calculateDiscount(promo, orderAmount);

    // Update promo code usage count
    await this.prisma.promoCode.update({
      where: { id: promoCodeId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    return {
      discountAmount,
    };
  }

  private calculateDiscount(promo: any, orderAmount: number): number {
    let discount = 0;

    if (promo.type === 'percentage') {
      discount = (orderAmount * promo.value.toNumber()) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount.toNumber()) {
        discount = promo.maxDiscount.toNumber();
      }
    } else if (promo.type === 'fixed_amount') {
      discount = promo.value.toNumber();
    }

    return Math.min(discount, orderAmount);
  }

  async getPromos(page = 1, limit = 20, activeOnly = true) {
    const skip = (page - 1) * limit;

    const where = activeOnly ? { isActive: true } : {};

    const [promos, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.promoCode.count({ where }),
    ]);

    return {
      data: promos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPromo(promoId: string) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { id: promoId },
    });

    if (!promo) {
      throw new BadRequestException('Promo code not found');
    }

    return promo;
  }

  async updatePromo(promoId: string, dto: Partial<CreatePromoDto>) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { id: promoId },
    });

    if (!promo) {
      throw new BadRequestException('Promo code not found');
    }

    if (dto.code && dto.code !== promo.code) {
      const existingPromo = await this.prisma.promoCode.findUnique({
        where: { code: dto.code.toUpperCase() },
      });

      if (existingPromo) {
        throw new BadRequestException('Promo code already exists');
      }
    }

    return this.prisma.promoCode.update({
      where: { id: promoId },
      data: {
        ...(dto.code && { code: dto.code.toUpperCase() }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.discountType && { discountType: dto.discountType }),
        ...(dto.discountValue !== undefined && { discountValue: dto.discountValue }),
        ...(dto.maxDiscount !== undefined && { maxDiscount: dto.maxDiscount }),
        ...(dto.minimumOrder !== undefined && { minimumOrder: dto.minimumOrder }),
        ...(dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
        ...(dto.usageLimitPerUser !== undefined && { usageLimitPerUser: dto.usageLimitPerUser }),
        ...(dto.validFrom && { validFrom: new Date(dto.validFrom) }),
        ...(dto.validUntil && { validUntil: new Date(dto.validUntil) }),
        ...(dto.applicableTo && { applicableTo: dto.applicableTo }),
        ...(dto.businessId !== undefined && { businessId: dto.businessId }),
      },
    });
  }

  async togglePromoStatus(promoId: string) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { id: promoId },
    });

    if (!promo) {
      throw new BadRequestException('Promo code not found');
    }

    return this.prisma.promoCode.update({
      where: { id: promoId },
      data: {
        isActive: !promo.isActive,
      },
    });
  }

  async deletePromo(promoId: string) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { id: promoId },
    });

    if (!promo) {
      throw new BadRequestException('Promo code not found');
    }

    await this.prisma.promoCode.delete({
      where: { id: promoId },
    });

    return { success: true, message: 'Promo code deleted successfully' };
  }

  async getUserPromoUsage(userId: string, page = 1, limit = 20) {
    // Note: PromoUsage tracking was removed from schema
    // Would need to track usage through order history or implement PromoUsage model
    return {
      data: [],
      meta: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  async getPromoStats(promoId: string) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { id: promoId },
    });

    if (!promo) {
      throw new BadRequestException('Promo code not found');
    }

    return {
      code: promo.code,
      totalUsages: promo.usageCount,
      usageLimit: promo.usageLimit,
      remainingUses: promo.usageLimit ? promo.usageLimit - promo.usageCount : null,
      isActive: promo.isActive,
      validFrom: promo.validFrom,
      validUntil: promo.validUntil,
    };
  }
}
