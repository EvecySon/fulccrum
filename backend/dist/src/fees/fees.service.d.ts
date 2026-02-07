import { PrismaService } from '../prisma/prisma.service';
export declare class FeesService {
    private prisma;
    constructor(prisma: PrismaService);
    private calculateDistance;
    private toRad;
    calculateDeliveryFee(businessLat: number, businessLon: number, customerLat: number, customerLon: number): Promise<{
        distance: number;
        deliveryFee: number;
    }>;
    calculateOrderFees(subtotal: number, businessLat: number, businessLon: number, customerLat: number, customerLon: number, promoDiscount?: number): Promise<{
        subtotal: number;
        deliveryFee: number;
        serviceFee: number;
        taxAmount: number;
        taxName: string;
        taxPercentage: number;
        discountAmount: number;
        total: number;
        distance: number;
        currency: string;
        breakdown: {
            baseDeliveryFee: number;
            perKmRate: number;
            distanceCharge: number;
            serviceFeePercentage: number;
            freeDeliveryApplied: boolean | null;
        };
    }>;
    getActiveSettings(): Promise<{
        id: string;
        baseDeliveryFee: import("@prisma/client-runtime-utils").Decimal;
        perKmRate: import("@prisma/client-runtime-utils").Decimal;
        minDeliveryFee: import("@prisma/client-runtime-utils").Decimal;
        maxDeliveryFee: import("@prisma/client-runtime-utils").Decimal;
        freeDeliveryThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        serviceFeePercentage: import("@prisma/client-runtime-utils").Decimal;
        minServiceFee: import("@prisma/client-runtime-utils").Decimal;
        maxServiceFee: import("@prisma/client-runtime-utils").Decimal | null;
        taxPercentage: import("@prisma/client-runtime-utils").Decimal;
        taxName: string;
        platformCommissionPercentage: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateSettings(data: any): Promise<{
        id: string;
        baseDeliveryFee: import("@prisma/client-runtime-utils").Decimal;
        perKmRate: import("@prisma/client-runtime-utils").Decimal;
        minDeliveryFee: import("@prisma/client-runtime-utils").Decimal;
        maxDeliveryFee: import("@prisma/client-runtime-utils").Decimal;
        freeDeliveryThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        serviceFeePercentage: import("@prisma/client-runtime-utils").Decimal;
        minServiceFee: import("@prisma/client-runtime-utils").Decimal;
        maxServiceFee: import("@prisma/client-runtime-utils").Decimal | null;
        taxPercentage: import("@prisma/client-runtime-utils").Decimal;
        taxName: string;
        platformCommissionPercentage: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getSettings(): Promise<{
        id: string;
        baseDeliveryFee: import("@prisma/client-runtime-utils").Decimal;
        perKmRate: import("@prisma/client-runtime-utils").Decimal;
        minDeliveryFee: import("@prisma/client-runtime-utils").Decimal;
        maxDeliveryFee: import("@prisma/client-runtime-utils").Decimal;
        freeDeliveryThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        serviceFeePercentage: import("@prisma/client-runtime-utils").Decimal;
        minServiceFee: import("@prisma/client-runtime-utils").Decimal;
        maxServiceFee: import("@prisma/client-runtime-utils").Decimal | null;
        taxPercentage: import("@prisma/client-runtime-utils").Decimal;
        taxName: string;
        platformCommissionPercentage: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    calculatePlatformCommission(orderTotal: number): Promise<{
        orderTotal: number;
        commissionPercentage: number;
        commissionAmount: number;
        businessEarnings: number;
    }>;
    previewOrderFees(businessId: string, customerAddressId: string, subtotal: number, promoCode?: string): Promise<{
        subtotal: number;
        deliveryFee: number;
        serviceFee: number;
        taxAmount: number;
        taxName: string;
        taxPercentage: number;
        discountAmount: number;
        total: number;
        distance: number;
        currency: string;
        breakdown: {
            baseDeliveryFee: number;
            perKmRate: number;
            distanceCharge: number;
            serviceFeePercentage: number;
            freeDeliveryApplied: boolean | null;
        };
    }>;
}
