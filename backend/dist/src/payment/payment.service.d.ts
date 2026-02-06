import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentService {
    private prisma;
    private config;
    private paystackSecretKey;
    private paystackBaseUrl;
    constructor(prisma: PrismaService, config: ConfigService);
    initializePayment(userId: string, orderId: string, amount: number): Promise<{
        authorizationUrl: any;
        accessCode: any;
        reference: any;
    }>;
    verifyPayment(reference: string): Promise<{
        success: boolean;
        amount: number;
        reference: any;
        paidAt: any;
        channel: any;
    } | {
        success: boolean;
        amount?: undefined;
        reference?: undefined;
        paidAt?: undefined;
        channel?: undefined;
    }>;
    processRefund(orderId: string, amount?: number): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getPaymentHistory(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            paymentMethod: string | null;
            orderNumber: string;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    handleWebhook(payload: any, signature: string): Promise<{
        received: boolean;
    }>;
}
