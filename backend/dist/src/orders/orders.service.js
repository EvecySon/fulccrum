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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrder(customerId, dto) {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const order = await this.prisma.order.create({
            data: {
                orderNumber,
                customerId,
                businessId: dto.businessId,
                status: 'pending',
                subtotal: dto.subtotal,
                deliveryFee: dto.deliveryFee,
                serviceFee: dto.serviceFee,
                taxAmount: dto.taxAmount,
                tipAmount: dto.tipAmount || 0,
                discountAmount: dto.discountAmount || 0,
                totalAmount: dto.totalAmount,
                specialInstructions: dto.specialInstructions,
                paymentMethod: dto.paymentMethod,
                paymentStatus: 'pending',
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        return order;
    }
    async getOrder(orderId, userId, userRole) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                driver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (userRole !== 'admin' && order.customerId !== userId && order.driverId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this order');
        }
        return order;
    }
    async updateOrderStatus(orderId, dto, userId, userRole) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (userRole !== 'admin' && userRole !== 'business_owner' && userRole !== 'driver') {
            throw new common_1.ForbiddenException('Only business owners, drivers, or admins can update order status');
        }
        const updateData = {
            status: dto.status,
        };
        if (dto.status === 'accepted') {
            updateData.acceptedAt = new Date();
        }
        else if (dto.status === 'preparing') {
            updateData.preparationStartedAt = new Date();
        }
        else if (dto.status === 'ready') {
            updateData.readyAt = new Date();
        }
        else if (dto.status === 'picked_up') {
            updateData.pickedUpAt = new Date();
            if (dto.driverId) {
                updateData.driverId = dto.driverId;
            }
        }
        else if (dto.status === 'delivered') {
            updateData.deliveredAt = new Date();
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                driver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return updatedOrder;
    }
    async getCustomerOrders(customerId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { customerId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    totalAmount: true,
                    createdAt: true,
                    estimatedDeliveryTime: true,
                },
            }),
            this.prisma.order.count({ where: { customerId } }),
        ]);
        return {
            data: orders,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getDriverOrders(driverId, status) {
        const where = { driverId };
        if (status) {
            where.status = status;
        }
        const orders = await this.prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
            },
        });
        return orders;
    }
    async getBusinessOrders(businessId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { businessId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    customer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                        },
                    },
                    driver: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),
            this.prisma.order.count({ where: { businessId } }),
        ]);
        return {
            data: orders,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async assignDriver(orderId, driverId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.status !== 'ready') {
            throw new common_1.ForbiddenException('Order must be ready before assigning a driver');
        }
        return this.prisma.order.update({
            where: { id: orderId },
            data: {
                driverId,
                status: 'picked_up',
                pickedUpAt: new Date(),
            },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map