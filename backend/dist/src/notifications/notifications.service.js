"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(userId, dto) {
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                data: dto.data || {},
            },
        });
        await this.sendPushNotification(userId, dto.title, dto.message, dto.data);
        return notification;
    }
    async sendPushNotification(userId, title, body, data) {
        const deviceTokens = await this.prisma.deviceToken.findMany({
            where: {
                userId,
                isActive: true,
            },
        });
        if (deviceTokens.length === 0) {
            console.log(`[PUSH] No active devices for user ${userId}`);
            return;
        }
        console.log(`[PUSH] Sending to ${deviceTokens.length} device(s) for user ${userId}`);
        console.log(`[PUSH] Title: ${title}`);
        console.log(`[PUSH] Body: ${body}`);
        console.log(`[PUSH] Data:`, data);
        return {
            sent: true,
            deviceCount: deviceTokens.length,
        };
    }
    async sendEmail(userId, subject, body) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, firstName: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        console.log(`[EMAIL] Sending to ${user.email}`);
        console.log(`[EMAIL] Subject: ${subject}`);
        console.log(`[EMAIL] Body: ${body}`);
        return { sent: true, email: user.email };
    }
    async sendSMS(userId, message) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { phone: true },
        });
        if (!user || !user.phone) {
            throw new common_1.NotFoundException('User phone not found');
        }
        console.log(`[SMS] Sending to ${user.phone}`);
        console.log(`[SMS] Message: ${message}`);
        return { sent: true, phone: user.phone };
    }
    async getUserNotifications(userId, unreadOnly = false, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const where = { userId };
        if (unreadOnly) {
            where.isRead = false;
        }
        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return {
            data: notifications,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                unreadCount,
            },
        };
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        if (notification.userId !== userId) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return {
            success: true,
            markedCount: result.count,
        };
    }
    async deleteNotification(notificationId, userId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        if (notification.userId !== userId) {
            throw new common_1.NotFoundException('Notification not found');
        }
        await this.prisma.notification.delete({
            where: { id: notificationId },
        });
        return { success: true };
    }
    async registerDeviceToken(userId, token, platform, deviceId) {
        const existing = await this.prisma.deviceToken.findUnique({
            where: { token },
        });
        if (existing) {
            return this.prisma.deviceToken.update({
                where: { token },
                data: {
                    userId,
                    platform,
                    deviceId,
                    isActive: true,
                    updatedAt: new Date(),
                },
            });
        }
        return this.prisma.deviceToken.create({
            data: {
                userId,
                token,
                platform,
                deviceId,
                isActive: true,
            },
        });
    }
    async deactivateDeviceToken(token) {
        return this.prisma.deviceToken.updateMany({
            where: { token },
            data: { isActive: false },
        });
    }
    async getUserDevices(userId) {
        return this.prisma.deviceToken.findMany({
            where: { userId, isActive: true },
            select: {
                id: true,
                platform: true,
                deviceId: true,
                createdAt: true,
            },
        });
    }
    async removeDevice(userId, deviceId) {
        const result = await this.prisma.deviceToken.deleteMany({
            where: {
                userId,
                id: deviceId,
            },
        });
        if (result.count === 0) {
            throw new common_1.NotFoundException('Device not found');
        }
        return { success: true };
    }
    async notifyOrderUpdate(userId, orderId, status, orderNumber) {
        const statusMessages = {
            accepted: 'Your order has been accepted!',
            preparing: 'Your order is being prepared',
            ready: 'Your order is ready for pickup',
            picked_up: 'Your order has been picked up by the driver',
            in_transit: 'Your order is on the way',
            delivered: 'Your order has been delivered',
            cancelled: 'Your order has been cancelled',
        };
        const message = statusMessages[status] || 'Your order status has been updated';
        return this.createNotification(userId, {
            type: 'order_update',
            title: `Order ${orderNumber}`,
            message,
            data: { orderId, status },
        });
    }
    async notifyWithdrawalUpdate(userId, amount, status) {
        const statusMessages = {
            confirmed: `Your withdrawal of $${amount} has been confirmed`,
            processing: `Your withdrawal of $${amount} is being processed`,
            completed: `Your withdrawal of $${amount} has been completed`,
            failed: `Your withdrawal of $${amount} has failed`,
        };
        const message = statusMessages[status] || 'Withdrawal status updated';
        return this.createNotification(userId, {
            type: 'payment_update',
            title: 'Withdrawal Update',
            message,
            data: { amount, status },
        });
    }
    async notifyNewMessage(userId, from, preview) {
        return this.createNotification(userId, {
            type: 'support_message',
            title: `New message from ${from}`,
            message: preview,
            data: { from },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map