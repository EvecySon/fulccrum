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
exports.PromosController = void 0;
const common_1 = require("@nestjs/common");
const promos_service_1 = require("./promos.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_promo_dto_1 = require("./dto/create-promo.dto");
const validate_promo_dto_1 = require("./dto/validate-promo.dto");
let PromosController = class PromosController {
    promosService;
    constructor(promosService) {
        this.promosService = promosService;
    }
    async createPromo(dto) {
        return this.promosService.createPromo(dto);
    }
    async validatePromo(req, dto) {
        return this.promosService.validatePromo(req.user.sub, dto);
    }
    async getPromos(page, limit, activeOnly) {
        return this.promosService.getPromos(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20, activeOnly !== 'false');
    }
    async getMyPromoUsage(req, page, limit) {
        return this.promosService.getUserPromoUsage(req.user.sub, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
    async getPromo(id) {
        return this.promosService.getPromo(id);
    }
    async getPromoStats(id) {
        return this.promosService.getPromoStats(id);
    }
    async updatePromo(id, dto) {
        return this.promosService.updatePromo(id, dto);
    }
    async togglePromoStatus(id) {
        return this.promosService.togglePromoStatus(id);
    }
    async deletePromo(id) {
        return this.promosService.deletePromo(id);
    }
};
exports.PromosController = PromosController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_promo_dto_1.CreatePromoDto]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "createPromo", null);
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, validate_promo_dto_1.ValidatePromoDto]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "validatePromo", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "getPromos", null);
__decorate([
    (0, common_1.Get)('my-usage'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "getMyPromoUsage", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "getPromo", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "getPromoStats", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "updatePromo", null);
__decorate([
    (0, common_1.Patch)(':id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "togglePromoStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "deletePromo", null);
exports.PromosController = PromosController = __decorate([
    (0, common_1.Controller)('promos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [promos_service_1.PromosService])
], PromosController);
//# sourceMappingURL=promos.controller.js.map