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
exports.ZonesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ZonesService = class ZonesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    isPointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].lat;
            const yi = polygon[i].lng;
            const xj = polygon[j].lat;
            const yj = polygon[j].lng;
            const intersect = yi > point.lng !== yj > point.lng &&
                point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
            if (intersect)
                inside = !inside;
        }
        return inside;
    }
    async createZone(businessId, data) {
        if (!Array.isArray(data.coordinates) || data.coordinates.length < 3) {
            throw new common_1.BadRequestException('Zone must have at least 3 coordinate points');
        }
        return this.prisma.deliveryZone.create({
            data: {
                businessId,
                name: data.name,
                description: data.description,
                coordinates: data.coordinates,
                deliveryFee: data.deliveryFee,
                minimumOrder: data.minimumOrder,
                maxOrders: data.maxOrders,
                estimatedDeliveryTime: data.estimatedDeliveryTime || 30,
                isActive: data.isActive !== false,
            },
        });
    }
    async getBusinessZones(businessId) {
        return this.prisma.deliveryZone.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getZone(zoneId) {
        const zone = await this.prisma.deliveryZone.findUnique({
            where: { id: zoneId },
            include: {
                business: {
                    select: {
                        businessName: true,
                        businessType: true,
                    },
                },
            },
        });
        if (!zone) {
            throw new common_1.NotFoundException('Delivery zone not found');
        }
        return zone;
    }
    async updateZone(zoneId, data) {
        const zone = await this.prisma.deliveryZone.findUnique({
            where: { id: zoneId },
        });
        if (!zone) {
            throw new common_1.NotFoundException('Delivery zone not found');
        }
        return this.prisma.deliveryZone.update({
            where: { id: zoneId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.coordinates && { coordinates: data.coordinates }),
                ...(data.deliveryFee !== undefined && { deliveryFee: data.deliveryFee }),
                ...(data.minimumOrder !== undefined && { minimumOrder: data.minimumOrder }),
                ...(data.maxOrders !== undefined && { maxOrders: data.maxOrders }),
                ...(data.estimatedDeliveryTime !== undefined && {
                    estimatedDeliveryTime: data.estimatedDeliveryTime,
                }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
        });
    }
    async deleteZone(zoneId) {
        const zone = await this.prisma.deliveryZone.findUnique({
            where: { id: zoneId },
        });
        if (!zone) {
            throw new common_1.NotFoundException('Delivery zone not found');
        }
        await this.prisma.deliveryZone.delete({
            where: { id: zoneId },
        });
        return { success: true, message: 'Delivery zone deleted successfully' };
    }
    async checkDeliveryAvailability(businessId, latitude, longitude) {
        const zones = await this.prisma.deliveryZone.findMany({
            where: {
                businessId,
                isActive: true,
            },
        });
        const point = { lat: latitude, lng: longitude };
        for (const zone of zones) {
            const coordinates = zone.coordinates;
            if (this.isPointInPolygon(point, coordinates)) {
                return {
                    available: true,
                    zone: {
                        id: zone.id,
                        name: zone.name,
                        deliveryFee: zone.deliveryFee,
                        minimumOrder: zone.minimumOrder,
                        estimatedDeliveryTime: zone.estimatedDeliveryTime,
                    },
                };
            }
        }
        return {
            available: false,
            message: 'Delivery not available in your area',
        };
    }
    async getActiveOrdersInZone(zoneId) {
        const zone = await this.prisma.deliveryZone.findUnique({
            where: { id: zoneId },
        });
        if (!zone) {
            throw new common_1.NotFoundException('Delivery zone not found');
        }
        return {
            zoneId,
            zoneName: zone.name,
            activeOrders: 0,
            maxOrders: zone.maxOrders,
            capacityAvailable: true,
        };
    }
};
exports.ZonesService = ZonesService;
exports.ZonesService = ZonesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ZonesService);
//# sourceMappingURL=zones.service.js.map