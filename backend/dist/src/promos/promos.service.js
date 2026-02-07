"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PromosService = class PromosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPromo(dto) {
        const existingPromo = await this.prisma.promoCode.findUnique({
            where: { code: dto.code.toUpperCase() },
        });
        if (existingPromo) {
            throw new common_1.BadRequestException('Promo code already exists');
        }
        if (dto.discountType === 'percentage' && dto.discountValue > 100) {
            throw new common_1.BadRequestException('Percentage discount cannot exceed 100%');
        }
        return this.prisma.promoCode.create({
            data: {
                code: dto.code.toUpperCase(),
                description: dto.description,
                discountType: dto.discountType,
                discountValue: dto.discountValue,
                maxDiscount: dto.maxDiscount,
                minimumOrder: dto.minimumOrder || 0,
                usageLimit: dto.usageLimit,
                usageLimitPerUser: dto.usageLimitPerUser,
                validFrom: new Date(dto.validFrom),
                validUntil: new Date(dto.validUntil),
                applicableTo: dto.applicableTo,
                businessId: dto.businessId,
            },
        });
    }
    async validatePromo(userId, dto) {
        const promo = await this.prisma.promoCode.findUnique({
            where: { code: dto.code.toUpperCase() },
            include: {
                usages: {
                    where: { userId },
                },
            },
        });
        if (!promo) {
            throw new common_1.BadRequestException('Invalid promo code');
        }
        if (!promo.isActive) {
            throw new common_1.BadRequestException('Promo code is not active');
        }
        const now = new Date();
        if (now < promo.validFrom || now > promo.validUntil) {
            throw new common_1.BadRequestException('Promo code has expired or is not yet valid');
        }
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
            throw new common_1.BadRequestException('Promo code usage limit reached');
        }
        if (promo.usageLimitPerUser) {
            const userUsageCount = promo.usages.length;
            if (userUsageCount >= promo.usageLimitPerUser) {
                throw new common_1.BadRequestException('You have already used this promo code the maximum number of times');
            }
        }
        if (dto.orderAmount < promo.minimumOrder.toNumber()) {
            throw new common_1.BadRequestException(`Minimum order amount of ₦${promo.minimumOrder} required for this promo code`);
        }
        if (promo.applicableTo === 'specific_business' && promo.businessId !== dto.businessId) {
            throw new common_1.BadRequestException('This promo code is not applicable to this business');
        }
        if (promo.applicableTo === 'first_order') {
            const orderCount = await this.prisma.order.count({
                where: {
                    customerId: userId,
                    status: 'delivered',
                },
            });
            if (orderCount > 0) {
                throw new common_1.BadRequestException('This promo code is only valid for first orders');
            }
        }
        const discountAmount = this.calculateDiscount(promo, dto.orderAmount);
        return {
            valid: true,
            promoCode: {
                id: promo.id,
                code: promo.code,
                description: promo.description,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
            },
            discountAmount,
            finalAmount: dto.orderAmount - discountAmount,
        };
    }
    async applyPromo(userId, promoCodeId, orderId, orderAmount) {
        const promo = await this.prisma.promoCode.findUnique({
            where: { id: promoCodeId },
        });
        if (!promo) {
            throw new common_1.BadRequestException('Invalid promo code');
        }
        const discountAmount = this.calculateDiscount(promo, orderAmount);
        const [usage] = await this.prisma.$transaction([
            this.prisma.promoUsage.create({
                data: {
                    promoCodeId,
                    userId,
                    orderId,
                    discountAmount,
                },
            }),
            this.prisma.promoCode.update({
                where: { id: promoCodeId },
                data: {
                    usedCount: {
                        increment: 1,
                    },
                },
            }),
        ]);
        return {
            usage,
            discountAmount,
        };
    }
    calculateDiscount(promo, orderAmount) {
        let discount = 0;
        if (promo.discountType === 'percentage') {
            discount = (orderAmount * promo.discountValue.toNumber()) / 100;
            if (promo.maxDiscount && discount > promo.maxDiscount.toNumber()) {
                discount = promo.maxDiscount.toNumber();
            }
        }
        else {
            discount = promo.discountValue.toNumber();
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
    async getPromo(promoId) {
        const promo = await this.prisma.promoCode.findUnique({
            where: { id: promoId },
            include: {
                usages: {
                    take: 10,
                    orderBy: { usedAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
        if (!promo) {
            throw new common_1.BadRequestException('Promo code not found');
        }
        return promo;
    }
    async updatePromo(promoId, dto) {
        const promo = await this.prisma.promoCode.findUnique({
            where: { id: promoId },
        });
        if (!promo) {
            throw new common_1.BadRequestException('Promo code not found');
        }
        if (dto.code && dto.code !== promo.code) {
            const existingPromo = await this.prisma.promoCode.findUnique({
                where: { code: dto.code.toUpperCase() },
            });
            if (existingPromo) {
                throw new common_1.BadRequestException('Promo code already exists');
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
    async togglePromoStatus(promoId) {
        const promo = await this.prisma.promoCode.findUnique({
            where: { id: promoId },
        });
        if (!promo) {
            throw new common_1.BadRequestException('Promo code not found');
        }
        return this.prisma.promoCode.update({
            where: { id: promoId },
            data: {
                isActive: !promo.isActive,
            },
        });
    }
    async deletePromo(promoId) {
        const promo = await this.prisma.promoCode.findUnique({
            where: { id: promoId },
        });
        if (!promo) {
            throw new common_1.BadRequestException('Promo code not found');
        }
        await this.prisma.promoCode.delete({
            where: { id: promoId },
        });
        return { success: true, message: 'Promo code deleted successfully' };
    }
    async getUserPromoUsage(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [usages, total] = await Promise.all([
            this.prisma.promoUsage.findMany({
                where: { userId },
                include: {
                    promoCode: {
                        select: {
                            code: true,
                            description: true,
                            discountType: true,
                            discountValue: true,
                        },
                    },
                },
                orderBy: { usedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.promoUsage.count({ where: { userId } }),
        ]);
        return {
            data: usages,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPromoStats(promoId) {
        const [promo, usages] = await Promise.all([
            this.prisma.promoCode.findUnique({
                where: { id: promoId },
            }),
            this.prisma.promoUsage.findMany({
                where: { promoCodeId: promoId },
            }),
        ]);
        if (!promo) {
            throw new common_1.BadRequestException('Promo code not found');
        }
        const totalDiscount = usages.reduce((sum, u) => sum + u.discountAmount.toNumber(), 0);
        const uniqueUsers = new Set(usages.map((u) => u.userId)).size;
        return {
            code: promo.code,
            totalUsages: promo.usedCount,
            uniqueUsers,
            totalDiscountGiven: totalDiscount,
            averageDiscountPerUse: usages.length > 0 ? totalDiscount / usages.length : 0,
            usageLimit: promo.usageLimit,
            remainingUses: promo.usageLimit ? promo.usageLimit - promo.usedCount : null,
            isActive: promo.isActive,
            validFrom: promo.validFrom,
            validUntil: promo.validUntil,
        };
    }
};
exports.PromosService = PromosService;
exports.PromosService = PromosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromosService);
//# sourceMappingURL=promos.service.js.map