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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationController = void 0;
const common_1 = require("@nestjs/common");
const location_service_1 = require("./location.service");
const update_location_dto_1 = require("./dto/update-location.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let LocationController = class LocationController {
    locationService;
    constructor(locationService) {
        this.locationService = locationService;
    }
    async updateLocation(req, dto) {
        return this.locationService.updateDriverLocation(req.user.sub, dto);
    }
    async getCurrentLocation(req) {
        return this.locationService.getDriverLocation(req.user.sub);
    }
    async getDriverLocation(driverId) {
        return this.locationService.getDriverLocation(driverId);
    }
    async getLocationHistory(driverId, hours) {
        return this.locationService.getDriverLocationHistory(driverId, hours ? parseInt(hours) : 24);
    }
    async setOnlineStatus(req, isOnline) {
        return this.locationService.setDriverOnlineStatus(req.user.sub, isOnline);
    }
    async getNearbyDrivers(latitude, longitude, radius) {
        return this.locationService.getNearbyDrivers(parseFloat(latitude), parseFloat(longitude), radius ? parseFloat(radius) : 5);
    }
    async trackOrder(orderId) {
        return this.locationService.trackOrderDelivery(orderId);
    }
};
exports.LocationController = LocationController;
__decorate([
    (0, common_1.Post)('driver/update'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_location_dto_1.UpdateLocationDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Get)('driver/current'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getCurrentLocation", null);
__decorate([
    (0, common_1.Get)('driver/:driverId'),
    __param(0, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getDriverLocation", null);
__decorate([
    (0, common_1.Get)('driver/:driverId/history'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getLocationHistory", null);
__decorate([
    (0, common_1.Post)('driver/online'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('isOnline')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "setOnlineStatus", null);
__decorate([
    (0, common_1.Get)('nearby'),
    __param(0, (0, common_1.Query)('latitude')),
    __param(1, (0, common_1.Query)('longitude')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getNearbyDrivers", null);
__decorate([
    (0, common_1.Get)('track/order/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "trackOrder", null);
exports.LocationController = LocationController = __decorate([
    (0, common_1.Controller)('location'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [location_service_1.LocationService])
], LocationController);
//# sourceMappingURL=location.controller.js.map