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
exports.LocationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LocationService = class LocationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateDriverLocation(driverId, dto) {
        const driver = await this.prisma.driverProfile.findUnique({
            where: { userId: driverId },
        });
        if (!driver) {
            throw new common_1.BadRequestException('Driver profile not found');
        }
        const location = await this.prisma.driverLocation.create({
            data: {
                driverId,
                latitude: dto.latitude,
                longitude: dto.longitude,
                accuracy: dto.accuracy,
                heading: dto.heading,
                speed: dto.speed,
            },
        });
        await this.prisma.driverProfile.update({
            where: { userId: driverId },
            data: { lastLocationUpdate: new Date() },
        });
        return location;
    }
    async getDriverLocation(driverId) {
        const location = await this.prisma.driverLocation.findFirst({
            where: { driverId },
            orderBy: { timestamp: 'desc' },
        });
        if (!location) {
            throw new common_1.BadRequestException('No location data found for driver');
        }
        return location;
    }
    async getDriverLocationHistory(driverId, hours = 24) {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.prisma.driverLocation.findMany({
            where: {
                driverId,
                timestamp: { gte: since },
            },
            orderBy: { timestamp: 'desc' },
            take: 100,
        });
    }
    async getNearbyDrivers(latitude, longitude, radiusKm = 5) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const drivers = await this.prisma.driverProfile.findMany({
            where: {
                onlineStatus: true,
                lastLocationUpdate: { gte: fiveMinutesAgo },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
            },
        });
        const driversWithLocations = await Promise.all(drivers.map(async (driver) => {
            const location = await this.prisma.driverLocation.findFirst({
                where: { driverId: driver.userId },
                orderBy: { timestamp: 'desc' },
            });
            if (!location)
                return null;
            const distance = this.calculateDistance(latitude, longitude, Number(location.latitude), Number(location.longitude));
            if (distance > radiusKm)
                return null;
            return {
                driver: {
                    id: driver.userId,
                    name: `${driver.user.firstName} ${driver.user.lastName}`,
                    phone: driver.user.phone,
                    rating: Number(driver.rating),
                    vehicleType: driver.vehicleType,
                },
                location: {
                    latitude: Number(location.latitude),
                    longitude: Number(location.longitude),
                    accuracy: location.accuracy,
                    timestamp: location.timestamp,
                },
                distance: Math.round(distance * 100) / 100,
            };
        }));
        return driversWithLocations
            .filter((d) => d !== null)
            .sort((a, b) => a.distance - b.distance);
    }
    async trackOrderDelivery(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                driver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.BadRequestException('Order not found');
        }
        if (!order.driverId) {
            throw new common_1.BadRequestException('No driver assigned to this order');
        }
        const location = await this.getDriverLocation(order.driverId);
        return {
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
            },
            driver: order.driver,
            location: {
                latitude: Number(location.latitude),
                longitude: Number(location.longitude),
                accuracy: location.accuracy,
                heading: location.heading,
                speed: location.speed,
                timestamp: location.timestamp,
            },
        };
    }
    async setDriverOnlineStatus(driverId, isOnline) {
        return this.prisma.driverProfile.update({
            where: { userId: driverId },
            data: { onlineStatus: isOnline },
        });
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    async cleanupOldLocations(daysToKeep = 7) {
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
        const result = await this.prisma.driverLocation.deleteMany({
            where: {
                timestamp: { lt: cutoffDate },
            },
        });
        return {
            deleted: result.count,
            message: `Deleted ${result.count} location records older than ${daysToKeep} days`,
        };
    }
};
exports.LocationService = LocationService;
exports.LocationService = LocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationService);
//# sourceMappingURL=location.service.js.map