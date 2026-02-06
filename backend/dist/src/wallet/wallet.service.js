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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
let WalletService = class WalletService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateWallet(userId) {
        let wallet = await this.prisma.digitalWallet.findUnique({
            where: { userId },
        });
        if (!wallet) {
            wallet = await this.prisma.digitalWallet.create({
                data: { userId },
            });
        }
        return wallet;
    }
    async getBalance(userId) {
        const wallet = await this.getOrCreateWallet(userId);
        return {
            balance: Number(wallet.balance),
            pendingBalance: Number(wallet.pendingBalance),
            frozenBalance: Number(wallet.frozenBalance),
            availableBalance: Number(wallet.balance) - Number(wallet.frozenBalance),
            currency: wallet.currency,
        };
    }
    async addFunds(userId, amount, description) {
        const wallet = await this.getOrCreateWallet(userId);
        const updatedWallet = await this.prisma.digitalWallet.update({
            where: { id: wallet.id },
            data: {
                balance: {
                    increment: amount,
                },
            },
        });
        return {
            success: true,
            newBalance: Number(updatedWallet.balance),
            message: `Added ${amount} to wallet`,
        };
    }
    async requestWithdrawal(userId, amount, ipAddress) {
        const wallet = await this.getOrCreateWallet(userId);
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than 0');
        }
        if (amount > 10000) {
            throw new common_1.BadRequestException('Maximum withdrawal amount is 10,000 per request');
        }
        const availableBalance = Number(wallet.balance) - Number(wallet.frozenBalance);
        if (amount > availableBalance) {
            throw new common_1.BadRequestException(`Insufficient balance. Available: ${availableBalance}`);
        }
        const recentRequest = await this.prisma.withdrawalRequest.findFirst({
            where: {
                userId,
                requestedAt: {
                    gte: new Date(Date.now() - 5 * 60 * 1000),
                },
                status: {
                    in: ['pending', 'confirmed', 'processing'],
                },
            },
        });
        if (recentRequest) {
            throw new common_1.BadRequestException('Please wait 5 minutes between withdrawal requests');
        }
        const confirmationCode = (0, crypto_1.randomInt)(100000, 999999).toString();
        const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const request = await this.prisma.withdrawalRequest.create({
            data: {
                userId,
                walletId: wallet.id,
                amount,
                confirmationCode,
                codeExpiresAt,
                ipAddress,
                status: 'pending',
            },
        });
        console.log(`[WITHDRAWAL] Confirmation code for ${userId}: ${confirmationCode}`);
        return {
            requestId: request.id,
            amount: Number(request.amount),
            expiresAt: request.codeExpiresAt,
            message: 'Confirmation code sent to your email. Code expires in 10 minutes.',
        };
    }
    async confirmWithdrawal(userId, requestId, code) {
        const request = await this.prisma.withdrawalRequest.findUnique({
            where: { id: requestId },
            include: { wallet: true },
        });
        if (!request) {
            throw new common_1.NotFoundException('Withdrawal request not found');
        }
        if (request.userId !== userId) {
            throw new common_1.BadRequestException('This withdrawal request does not belong to you');
        }
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException(`Request already ${request.status}`);
        }
        if (!request.confirmationCode || request.confirmationCode !== code) {
            throw new common_1.BadRequestException('Invalid confirmation code');
        }
        if (!request.codeExpiresAt || new Date() > request.codeExpiresAt) {
            await this.prisma.withdrawalRequest.update({
                where: { id: requestId },
                data: { status: 'expired' },
            });
            throw new common_1.BadRequestException('Confirmation code expired');
        }
        const availableBalance = Number(request.wallet.balance) - Number(request.wallet.frozenBalance);
        if (Number(request.amount) > availableBalance) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        await this.prisma.withdrawalRequest.update({
            where: { id: requestId },
            data: {
                status: 'confirmed',
                confirmedAt: new Date(),
            },
        });
        await this.prisma.digitalWallet.update({
            where: { id: request.walletId },
            data: {
                balance: {
                    decrement: request.amount,
                },
                pendingBalance: {
                    increment: request.amount,
                },
            },
        });
        await this.processWithdrawal(requestId);
        return {
            success: true,
            amount: Number(request.amount),
            message: 'Withdrawal confirmed and processing',
        };
    }
    async processWithdrawal(requestId) {
        setTimeout(async () => {
            const request = await this.prisma.withdrawalRequest.findUnique({
                where: { id: requestId },
            });
            if (request && request.status === 'confirmed') {
                await this.prisma.withdrawalRequest.update({
                    where: { id: requestId },
                    data: {
                        status: 'completed',
                        processedAt: new Date(),
                    },
                });
                await this.prisma.digitalWallet.update({
                    where: { id: request.walletId },
                    data: {
                        pendingBalance: {
                            decrement: request.amount,
                        },
                    },
                });
                console.log(`[WITHDRAWAL] Completed withdrawal ${requestId}`);
            }
        }, 2000);
    }
    async getWithdrawalHistory(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            this.prisma.withdrawalRequest.findMany({
                where: { userId },
                orderBy: { requestedAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    requestedAt: true,
                    confirmedAt: true,
                    processedAt: true,
                },
            }),
            this.prisma.withdrawalRequest.count({ where: { userId } }),
        ]);
        return {
            data: requests.map(r => ({
                ...r,
                amount: Number(r.amount),
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async cancelWithdrawalRequest(userId, requestId) {
        const request = await this.prisma.withdrawalRequest.findUnique({
            where: { id: requestId },
        });
        if (!request) {
            throw new common_1.NotFoundException('Withdrawal request not found');
        }
        if (request.userId !== userId) {
            throw new common_1.BadRequestException('This withdrawal request does not belong to you');
        }
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException('Can only cancel pending requests');
        }
        await this.prisma.withdrawalRequest.update({
            where: { id: requestId },
            data: { status: 'cancelled' },
        });
        return {
            success: true,
            message: 'Withdrawal request cancelled',
        };
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map