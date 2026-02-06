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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    verifyAdmin(userRole) {
        if (userRole !== 'admin') {
            throw new common_1.ForbiddenException('Admin access required');
        }
    }
    async getAllUsers(userRole, page = 1, limit = 50) {
        this.verifyAdmin(userRole);
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    lastLogin: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);
        return { data: users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
    async suspendUser(userRole, userId) {
        this.verifyAdmin(userRole);
        return this.prisma.user.update({
            where: { id: userId },
            data: { status: 'suspended' },
        });
    }
    async activateUser(userRole, userId) {
        this.verifyAdmin(userRole);
        return this.prisma.user.update({
            where: { id: userId },
            data: { status: 'active' },
        });
    }
    async getAllOrders(userRole, page = 1, limit = 50) {
        this.verifyAdmin(userRole);
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                skip,
                take: limit,
                include: {
                    customer: { select: { firstName: true, lastName: true, email: true } },
                    driver: { select: { firstName: true, lastName: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count(),
        ]);
        return { data: orders, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
    async getPlatformMetrics(userRole) {
        this.verifyAdmin(userRole);
        const [totalUsers, totalOrders, totalRevenue, activeDrivers, pendingWithdrawals, totalBusinesses,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.order.count(),
            this.prisma.order.aggregate({
                where: { paymentStatus: 'paid' },
                _sum: { totalAmount: true },
            }),
            this.prisma.driverProfile.count({ where: { onlineStatus: true } }),
            this.prisma.withdrawalRequest.count({ where: { status: 'pending' } }),
            this.prisma.businessProfile.count(),
        ]);
        return {
            totalUsers,
            totalOrders,
            totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
            activeDrivers,
            pendingWithdrawals,
            totalBusinesses,
        };
    }
    async getPendingWithdrawals(userRole, page = 1, limit = 50) {
        this.verifyAdmin(userRole);
        const skip = (page - 1) * limit;
        const [withdrawals, total] = await Promise.all([
            this.prisma.withdrawalRequest.findMany({
                where: { status: { in: ['pending', 'confirmed'] } },
                skip,
                take: limit,
                include: {
                    user: { select: { firstName: true, lastName: true, email: true } },
                },
                orderBy: { requestedAt: 'desc' },
            }),
            this.prisma.withdrawalRequest.count({ where: { status: { in: ['pending', 'confirmed'] } } }),
        ]);
        return { data: withdrawals, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
    async approveWithdrawal(userRole, withdrawalId) {
        this.verifyAdmin(userRole);
        return this.prisma.withdrawalRequest.update({
            where: { id: withdrawalId },
            data: { status: 'processing' },
        });
    }
    async rejectWithdrawal(userRole, withdrawalId, reason) {
        this.verifyAdmin(userRole);
        return this.prisma.withdrawalRequest.update({
            where: { id: withdrawalId },
            data: {
                status: 'failed',
                failedReason: reason,
            },
        });
    }
    async getRecentActivity(userRole, limit = 20) {
        this.verifyAdmin(userRole);
        const [recentOrders, recentUsers] = await Promise.all([
            this.prisma.order.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    totalAmount: true,
                    createdAt: true,
                    customer: { select: { firstName: true, lastName: true } },
                },
            }),
            this.prisma.user.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            }),
        ]);
        return {
            recentOrders,
            recentUsers,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map