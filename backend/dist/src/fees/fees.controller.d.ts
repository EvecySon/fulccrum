import { FeesService } from './fees.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CalculateFeesDto } from './dto/calculate-fees.dto';
export declare class FeesController {
    private feesService;
    constructor(feesService: FeesService);
    getSettings(): Promise<{
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
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateSettings(dto: UpdateSettingsDto): Promise<{
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
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    calculateFees(dto: CalculateFeesDto): Promise<{
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
