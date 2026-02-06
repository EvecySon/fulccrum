import { ConfigService } from '@nestjs/config';
export declare class TermiiService {
    private config;
    private apiKey;
    private senderId;
    private baseUrl;
    constructor(config: ConfigService);
    sendSMS(to: string, message: string): Promise<{
        success: boolean;
        messageId: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        messageId?: undefined;
        message?: undefined;
    }>;
    sendOTP(phoneNumber: string): Promise<{
        otp: string;
        expiresAt: Date;
    }>;
    sendOrderNotification(phoneNumber: string, orderNumber: string, status: string): Promise<{
        success: boolean;
        messageId: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        messageId?: undefined;
        message?: undefined;
    }>;
    sendWithdrawalCode(phoneNumber: string, code: string, amount: number): Promise<{
        success: boolean;
        messageId: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        messageId?: undefined;
        message?: undefined;
    }>;
    sendWelcomeSMS(phoneNumber: string, firstName: string): Promise<{
        success: boolean;
        messageId: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        messageId?: undefined;
        message?: undefined;
    }>;
    sendDriverAssignment(phoneNumber: string, orderNumber: string, driverName: string): Promise<{
        success: boolean;
        messageId: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        messageId?: undefined;
        message?: undefined;
    }>;
}
