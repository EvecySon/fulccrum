import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class FirebaseService implements OnModuleInit {
    private config;
    private isInitialized;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    sendPushNotification(tokens: string[], title: string, body: string, data?: any): Promise<{
        successCount: number;
        failureCount: number;
        message: string;
        responses?: undefined;
    } | {
        successCount: any;
        failureCount: any;
        responses: any;
        message?: undefined;
    }>;
    sendToTopic(topic: string, title: string, body: string, data?: any): Promise<{
        success: boolean;
        message: string;
        messageId?: undefined;
    } | {
        success: boolean;
        messageId: string;
        message?: undefined;
    }>;
}
