import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    createNotification(req: any, dto: CreateNotificationDto): Promise<{
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
    getNotifications(req: any, unreadOnly?: string, page?: string, limit?: string): Promise<{
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
    markAsRead(id: string, req: any): Promise<{
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
    markAllAsRead(req: any): Promise<{
        success: boolean;
        markedCount: number;
    }>;
    deleteNotification(id: string, req: any): Promise<{
        success: boolean;
    }>;
    registerDevice(req: any, dto: RegisterDeviceDto): Promise<{
        id: string;
        token: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        isActive: boolean;
        platform: string;
        deviceId: string | null;
    }>;
    getDevices(req: any): Promise<{
        id: string;
        createdAt: Date;
        platform: string;
        deviceId: string | null;
    }[]>;
    removeDevice(deviceId: string, req: any): Promise<{
        success: boolean;
    }>;
    testPushNotification(req: any, body: {
        title: string;
        message: string;
    }): Promise<{
        sent: boolean;
        deviceCount: number;
    } | undefined>;
    testEmail(req: any, body: {
        subject: string;
        message: string;
    }): Promise<{
        sent: boolean;
        email: string;
    }>;
    testSMS(req: any, body: {
        message: string;
    }): Promise<{
        sent: boolean;
        phone: string;
    }>;
}
