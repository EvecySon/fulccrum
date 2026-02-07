import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { ValidatePromoDto } from './dto/validate-promo.dto';
export declare class PromosService {
    private prisma;
    constructor(prisma: PrismaService);
    createPromo(dto: CreatePromoDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string | null;
        isActive: boolean;
        description: string | null;
        code: string;
        discountType: string;
        discountValue: import("@prisma/client-runtime-utils").Decimal;
        maxDiscount: import("@prisma/client-runtime-utils").Decimal | null;
        minimumOrder: import("@prisma/client-runtime-utils").Decimal;
        usageLimit: number | null;
        usageLimitPerUser: number | null;
        usedCount: number;
        validFrom: Date;
        validUntil: Date;
        applicableTo: string;
    }>;
    validatePromo(userId: string, dto: ValidatePromoDto): Promise<{
        valid: boolean;
        promoCode: {
            id: string;
            code: string;
            description: string | null;
            discountType: string;
            discountValue: import("@prisma/client-runtime-utils").Decimal;
        };
        discountAmount: number;
        finalAmount: number;
    }>;
    applyPromo(userId: string, promoCodeId: string, orderId: string, orderAmount: number): Promise<{
        usage: {
            id: string;
            userId: string;
            discountAmount: import("@prisma/client-runtime-utils").Decimal;
            orderId: string;
            promoCodeId: string;
            usedAt: Date;
        };
        discountAmount: number;
    }>;
    private calculateDiscount;
    getPromos(page?: number, limit?: number, activeOnly?: boolean): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string | null;
            isActive: boolean;
            description: string | null;
            code: string;
            discountType: string;
            discountValue: import("@prisma/client-runtime-utils").Decimal;
            maxDiscount: import("@prisma/client-runtime-utils").Decimal | null;
            minimumOrder: import("@prisma/client-runtime-utils").Decimal;
            usageLimit: number | null;
            usageLimitPerUser: number | null;
            usedCount: number;
            validFrom: Date;
            validUntil: Date;
            applicableTo: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPromo(promoId: string): Promise<{
        usages: ({
            user: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            userId: string;
            discountAmount: import("@prisma/client-runtime-utils").Decimal;
            orderId: string;
            promoCodeId: string;
            usedAt: Date;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string | null;
        isActive: boolean;
        description: string | null;
        code: string;
        discountType: string;
        discountValue: import("@prisma/client-runtime-utils").Decimal;
        maxDiscount: import("@prisma/client-runtime-utils").Decimal | null;
        minimumOrder: import("@prisma/client-runtime-utils").Decimal;
        usageLimit: number | null;
        usageLimitPerUser: number | null;
        usedCount: number;
        validFrom: Date;
        validUntil: Date;
        applicableTo: string;
    }>;
    updatePromo(promoId: string, dto: Partial<CreatePromoDto>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string | null;
        isActive: boolean;
        description: string | null;
        code: string;
        discountType: string;
        discountValue: import("@prisma/client-runtime-utils").Decimal;
        maxDiscount: import("@prisma/client-runtime-utils").Decimal | null;
        minimumOrder: import("@prisma/client-runtime-utils").Decimal;
        usageLimit: number | null;
        usageLimitPerUser: number | null;
        usedCount: number;
        validFrom: Date;
        validUntil: Date;
        applicableTo: string;
    }>;
    togglePromoStatus(promoId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string | null;
        isActive: boolean;
        description: string | null;
        code: string;
        discountType: string;
        discountValue: import("@prisma/client-runtime-utils").Decimal;
        maxDiscount: import("@prisma/client-runtime-utils").Decimal | null;
        minimumOrder: import("@prisma/client-runtime-utils").Decimal;
        usageLimit: number | null;
        usageLimitPerUser: number | null;
        usedCount: number;
        validFrom: Date;
        validUntil: Date;
        applicableTo: string;
    }>;
    deletePromo(promoId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserPromoUsage(userId: string, page?: number, limit?: number): Promise<{
        data: ({
            promoCode: {
                description: string | null;
                code: string;
                discountType: string;
                discountValue: import("@prisma/client-runtime-utils").Decimal;
            };
        } & {
            id: string;
            userId: string;
            discountAmount: import("@prisma/client-runtime-utils").Decimal;
            orderId: string;
            promoCodeId: string;
            usedAt: Date;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPromoStats(promoId: string): Promise<{
        code: string;
        totalUsages: number;
        uniqueUsers: number;
        totalDiscountGiven: number;
        averageDiscountPerUse: number;
        usageLimit: number | null;
        remainingUses: number | null;
        isActive: boolean;
        validFrom: Date;
        validUntil: Date;
    }>;
}
