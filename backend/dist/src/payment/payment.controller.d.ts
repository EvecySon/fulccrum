import { PaymentService } from './payment.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
export declare class PaymentController {
    private paymentService;
    constructor(paymentService: PaymentService);
    initializePayment(req: any, dto: InitializePaymentDto): Promise<{
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
    refundPayment(orderId: string, amount?: number): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getPaymentHistory(req: any, page?: string, limit?: string): Promise<{
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
    handleWebhook(payload: any, req: any): Promise<{
        received: boolean;
    }>;
}
