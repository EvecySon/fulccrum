import { PromosService } from './promos.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { ValidatePromoDto } from './dto/validate-promo.dto';
export declare class PromosController {
    private promosService;
    constructor(promosService: PromosService);
    createPromo(dto: CreatePromoDto): Promise<{
        id: string;
        code: string;
        description: string | null;
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
        businessId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    validatePromo(req: any, dto: ValidatePromoDto): Promise<{
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
    getPromos(page?: string, limit?: string, activeOnly?: string): Promise<{
        data: {
            id: string;
            code: string;
            description: string | null;
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
            businessId: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyPromoUsage(req: any, page?: string, limit?: string): Promise<{
        data: ({
            promoCode: {
                code: string;
                description: string | null;
                discountType: string;
                discountValue: import("@prisma/client-runtime-utils").Decimal;
            };
        } & {
            id: string;
            userId: string;
            promoCodeId: string;
            orderId: string;
            discountAmount: import("@prisma/client-runtime-utils").Decimal;
            usedAt: Date;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPromo(id: string): Promise<{
        usages: ({
            user: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            userId: string;
            promoCodeId: string;
            orderId: string;
            discountAmount: import("@prisma/client-runtime-utils").Decimal;
            usedAt: Date;
        })[];
    } & {
        id: string;
        code: string;
        description: string | null;
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
        businessId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPromoStats(id: string): Promise<{
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
    updatePromo(id: string, dto: Partial<CreatePromoDto>): Promise<{
        id: string;
        code: string;
        description: string | null;
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
        businessId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    togglePromoStatus(id: string): Promise<{
        id: string;
        code: string;
        description: string | null;
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
        businessId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deletePromo(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
