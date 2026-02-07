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
exports.FeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FeesService = class FeesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
                Math.cos(this.toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }
    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    async calculateDeliveryFee(businessLat, businessLon, customerLat, customerLon) {
        const settings = await this.getActiveSettings();
        const distance = this.calculateDistance(businessLat, businessLon, customerLat, customerLon);
        let deliveryFee = settings.baseDeliveryFee.toNumber() + distance * settings.perKmRate.toNumber();
        if (deliveryFee < settings.minDeliveryFee.toNumber()) {
            deliveryFee = settings.minDeliveryFee.toNumber();
        }
        if (deliveryFee > settings.maxDeliveryFee.toNumber()) {
            deliveryFee = settings.maxDeliveryFee.toNumber();
        }
        return {
            distance: Math.round(distance * 100) / 100,
            deliveryFee: Math.round(deliveryFee * 100) / 100,
        };
    }
    async calculateOrderFees(subtotal, businessLat, businessLon, customerLat, customerLon, promoDiscount = 0) {
        const settings = await this.getActiveSettings();
        const { distance, deliveryFee: calculatedDeliveryFee } = await this.calculateDeliveryFee(businessLat, businessLon, customerLat, customerLon);
        let deliveryFee = calculatedDeliveryFee;
        if (settings.freeDeliveryThreshold &&
            subtotal >= settings.freeDeliveryThreshold.toNumber()) {
            deliveryFee = 0;
        }
        let serviceFee = (subtotal * settings.serviceFeePercentage.toNumber()) / 100;
        if (serviceFee < settings.minServiceFee.toNumber()) {
            serviceFee = settings.minServiceFee.toNumber();
        }
        if (settings.maxServiceFee && serviceFee > settings.maxServiceFee.toNumber()) {
            serviceFee = settings.maxServiceFee.toNumber();
        }
        const taxAmount = (subtotal * settings.taxPercentage.toNumber()) / 100;
        const total = subtotal + deliveryFee + serviceFee + taxAmount - promoDiscount;
        return {
            subtotal: Math.round(subtotal * 100) / 100,
            deliveryFee: Math.round(deliveryFee * 100) / 100,
            serviceFee: Math.round(serviceFee * 100) / 100,
            taxAmount: Math.round(taxAmount * 100) / 100,
            taxName: settings.taxName,
            taxPercentage: settings.taxPercentage.toNumber(),
            discountAmount: Math.round(promoDiscount * 100) / 100,
            total: Math.round(total * 100) / 100,
            distance: Math.round(distance * 100) / 100,
            currency: settings.currency,
            breakdown: {
                baseDeliveryFee: settings.baseDeliveryFee.toNumber(),
                perKmRate: settings.perKmRate.toNumber(),
                distanceCharge: Math.round((distance * settings.perKmRate.toNumber()) * 100) / 100,
                serviceFeePercentage: settings.serviceFeePercentage.toNumber(),
                freeDeliveryApplied: settings.freeDeliveryThreshold &&
                    subtotal >= settings.freeDeliveryThreshold.toNumber(),
            },
        };
    }
    async getActiveSettings() {
        let settings = await this.prisma.platformSettings.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
        if (!settings) {
            settings = await this.prisma.platformSettings.create({
                data: {
                    baseDeliveryFee: 200,
                    perKmRate: 50,
                    minDeliveryFee: 200,
                    maxDeliveryFee: 2000,
                    serviceFeePercentage: 5,
                    minServiceFee: 50,
                    taxPercentage: 7.5,
                    taxName: 'VAT',
                    platformCommissionPercentage: 15,
                    currency: 'NGN',
                    isActive: true,
                },
            });
        }
        return settings;
    }
    async updateSettings(data) {
        await this.prisma.platformSettings.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        });
        return this.prisma.platformSettings.create({
            data: {
                ...data,
                isActive: true,
            },
        });
    }
    async getSettings() {
        return this.getActiveSettings();
    }
    async calculatePlatformCommission(orderTotal) {
        const settings = await this.getActiveSettings();
        const commission = (orderTotal * settings.platformCommissionPercentage.toNumber()) / 100;
        return {
            orderTotal,
            commissionPercentage: settings.platformCommissionPercentage.toNumber(),
            commissionAmount: Math.round(commission * 100) / 100,
            businessEarnings: Math.round((orderTotal - commission) * 100) / 100,
        };
    }
    async previewOrderFees(businessId, customerAddressId, subtotal, promoCode) {
        const business = await this.prisma.businessProfile.findUnique({
            where: { userId: businessId },
            include: {
                addresses: {
                    where: { isDefault: true },
                    take: 1,
                },
            },
        });
        if (!business || !business.addresses[0]) {
            throw new common_1.BadRequestException('Business address not found');
        }
        const customerAddress = await this.prisma.address.findUnique({
            where: { id: customerAddressId },
        });
        if (!customerAddress) {
            throw new common_1.BadRequestException('Customer address not found');
        }
        const businessAddress = business.addresses[0];
        if (!businessAddress.latitude ||
            !businessAddress.longitude ||
            !customerAddress.latitude ||
            !customerAddress.longitude) {
            throw new common_1.BadRequestException('Address coordinates are missing');
        }
        let promoDiscount = 0;
        if (promoCode) {
        }
        return this.calculateOrderFees(subtotal, businessAddress.latitude.toNumber(), businessAddress.longitude.toNumber(), customerAddress.latitude.toNumber(), customerAddress.longitude.toNumber(), promoDiscount);
    }
};
exports.FeesService = FeesService;
exports.FeesService = FeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeesService);
//# sourceMappingURL=fees.service.js.map