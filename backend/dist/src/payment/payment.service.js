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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
let PaymentService = class PaymentService {
    prisma;
    config;
    paystackSecretKey;
    paystackBaseUrl = 'https://api.paystack.co';
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.paystackSecretKey = this.config.get('PAYSTACK_SECRET_KEY') || 'sk_test_xxx';
    }
    async initializePayment(userId, orderId, amount) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { customer: true },
        });
        if (!order) {
            throw new common_1.BadRequestException('Order not found');
        }
        if (order.customerId !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        const reference = `ORD-${order.orderNumber}-${Date.now()}`;
        try {
            const response = await axios_1.default.post(`${this.paystackBaseUrl}/transaction/initialize`, {
                email: order.customer.email,
                amount: Math.round(amount * 100),
                currency: 'NGN',
                reference,
                callback_url: this.config.get('PAYSTACK_CALLBACK_URL') || 'https://your-domain.com/payment/callback',
                metadata: {
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    userId,
                },
            }, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecretKey}`,
                    'Content-Type': 'application/json',
                },
            });
            await this.prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentId: reference,
                    paymentStatus: 'pending',
                },
            });
            return {
                authorizationUrl: response.data.data.authorization_url,
                accessCode: response.data.data.access_code,
                reference: response.data.data.reference,
            };
        }
        catch (error) {
            console.error('[PAYSTACK] Initialize error:', error.response?.data || error.message);
            throw new common_1.BadRequestException('Failed to initialize payment');
        }
    }
    async verifyPayment(reference) {
        try {
            const response = await axios_1.default.get(`${this.paystackBaseUrl}/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecretKey}`,
                },
            });
            const { data } = response.data;
            if (data.status === 'success') {
                const orderId = data.metadata.orderId;
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: {
                        paymentStatus: 'paid',
                        paymentMethod: data.channel,
                    },
                });
                return {
                    success: true,
                    amount: data.amount / 100,
                    reference: data.reference,
                    paidAt: data.paid_at,
                    channel: data.channel,
                };
            }
            return { success: false };
        }
        catch (error) {
            console.error('[PAYSTACK] Verify error:', error.response?.data || error.message);
            throw new common_1.BadRequestException('Failed to verify payment');
        }
    }
    async processRefund(orderId, amount) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order || !order.paymentId) {
            throw new common_1.BadRequestException('Invalid order or payment');
        }
        const refundAmount = amount || Number(order.totalAmount);
        try {
            const response = await axios_1.default.post(`${this.paystackBaseUrl}/refund`, {
                transaction: order.paymentId,
                amount: Math.round(refundAmount * 100),
            }, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecretKey}`,
                    'Content-Type': 'application/json',
                },
            });
            await this.prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentStatus: amount ? 'partially_refunded' : 'refunded',
                    status: 'refunded',
                },
            });
            return {
                success: true,
                message: 'Refund processed successfully',
                data: response.data,
            };
        }
        catch (error) {
            console.error('[PAYSTACK] Refund error:', error.response?.data || error.message);
            throw new common_1.BadRequestException('Failed to process refund');
        }
    }
    async getPaymentHistory(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            this.prisma.order.findMany({
                where: {
                    customerId: userId,
                    paymentStatus: { in: ['paid', 'refunded', 'partially_refunded'] },
                },
                select: {
                    id: true,
                    orderNumber: true,
                    totalAmount: true,
                    paymentStatus: true,
                    paymentMethod: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.order.count({
                where: {
                    customerId: userId,
                    paymentStatus: { in: ['paid', 'refunded', 'partially_refunded'] },
                },
            }),
        ]);
        return {
            data: payments,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async handleWebhook(payload, signature) {
        const { event, data } = payload;
        if (event === 'charge.success') {
            await this.verifyPayment(data.reference);
        }
        return { received: true };
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map