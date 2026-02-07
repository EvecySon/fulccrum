import { PromosService } from './promos.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { ValidatePromoDto } from './dto/validate-promo.dto';
export declare class PromosController {
    private promosService;
    constructor(promosService: PromosService);
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
    getMyPromoUsage(req: any, page?: string, limit?: string): Promise<{
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
    getPromo(id: string): Promise<{
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
    togglePromoStatus(id: string): Promise<{
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
    deletePromo(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
