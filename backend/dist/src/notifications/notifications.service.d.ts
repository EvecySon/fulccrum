import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createNotification(userId: string, dto: CreateNotificationDto): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        userId: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        isRead: boolean;
        sentAt: Date | null;
    }>;
    sendPushNotification(userId: string, title: string, body: string, data?: Record<string, any>): Promise<{
        sent: boolean;
        deviceCount: number;
    } | undefined>;
    sendEmail(userId: string, subject: string, body: string): Promise<{
        sent: boolean;
        email: string;
    }>;
    sendSMS(userId: string, message: string): Promise<{
        sent: boolean;
        phone: string;
    }>;
    getUserNotifications(userId: string, unreadOnly?: boolean, page?: number, limit?: number): Promise<{
        data: {
            data: import("@prisma/client/runtime/client").JsonValue | null;
            id: string;
            createdAt: Date;
            userId: string;
            type: import("@prisma/client").$Enums.NotificationType;
            title: string;
            message: string;
            isRead: boolean;
            sentAt: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            unreadCount: number;
        };
    }>;
    markAsRead(notificationId: string, userId: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        userId: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        isRead: boolean;
        sentAt: Date | null;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
        markedCount: number;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<{
        success: boolean;
    }>;
    registerDeviceToken(userId: string, token: string, platform: string, deviceId?: string): Promise<{
        id: string;
        token: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        isActive: boolean;
        platform: string;
        deviceId: string | null;
    }>;
    deactivateDeviceToken(token: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getUserDevices(userId: string): Promise<{
        id: string;
        createdAt: Date;
        platform: string;
        deviceId: string | null;
    }[]>;
    removeDevice(userId: string, deviceId: string): Promise<{
        success: boolean;
    }>;
    notifyOrderUpdate(userId: string, orderId: string, status: string, orderNumber: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        userId: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        isRead: boolean;
        sentAt: Date | null;
    }>;
    notifyWithdrawalUpdate(userId: string, amount: number, status: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        userId: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        isRead: boolean;
        sentAt: Date | null;
    }>;
    notifyNewMessage(userId: string, from: string, preview: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        userId: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        isRead: boolean;
        sentAt: Date | null;
    }>;
}
