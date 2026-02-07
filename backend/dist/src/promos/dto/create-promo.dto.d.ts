export declare class CreatePromoDto {
    code: string;
    description?: string;
    discountType: string;
    discountValue: number;
    maxDiscount?: number;
    minimumOrder?: number;
    usageLimit?: number;
    usageLimitPerUser?: number;
    validFrom: string;
    validUntil: string;
    applicableTo: string;
    businessId?: string;
}
