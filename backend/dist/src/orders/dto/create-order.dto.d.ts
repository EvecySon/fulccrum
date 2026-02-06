export declare class CreateOrderDto {
    businessId: string;
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    taxAmount: number;
    totalAmount: number;
    tipAmount?: number;
    discountAmount?: number;
    specialInstructions?: string;
    paymentMethod?: string;
}
