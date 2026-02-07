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
exports.ZonesController = void 0;
const common_1 = require("@nestjs/common");
const zones_service_1 = require("./zones.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ZonesController = class ZonesController {
    zonesService;
    constructor(zonesService) {
        this.zonesService = zonesService;
    }
    async createZone(req, data) {
        return this.zonesService.createZone(req.user.sub, data);
    }
    async getBusinessZones(businessId) {
        return this.zonesService.getBusinessZones(businessId);
    }
    async getZone(id) {
        return this.zonesService.getZone(id);
    }
    async updateZone(id, data) {
        return this.zonesService.updateZone(id, data);
    }
    async deleteZone(id) {
        return this.zonesService.deleteZone(id);
    }
    async checkAvailability(data) {
        return this.zonesService.checkDeliveryAvailability(data.businessId, data.latitude, data.longitude);
    }
    async getActiveOrders(id) {
        return this.zonesService.getActiveOrdersInZone(id);
    }
};
exports.ZonesController = ZonesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ZonesController.prototype, "createZone", null);
__decorate([
    (0, common_1.Get)('business/:businessId'),
    __param(0, (0, common_1.Param)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZonesController.prototype, "getBusinessZones", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZonesController.prototype, "getZone", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ZonesController.prototype, "updateZone", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZonesController.prototype, "deleteZone", null);
__decorate([
    (0, common_1.Post)('check-availability'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ZonesController.prototype, "checkAvailability", null);
__decorate([
    (0, common_1.Get)(':id/active-orders'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZonesController.prototype, "getActiveOrders", null);
exports.ZonesController = ZonesController = __decorate([
    (0, common_1.Controller)('zones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [zones_service_1.ZonesService])
], ZonesController);
//# sourceMappingURL=zones.controller.js.map