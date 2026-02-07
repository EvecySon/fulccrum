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
exports.SupportController = void 0;
const common_1 = require("@nestjs/common");
const support_service_1 = require("./support.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SupportController = class SupportController {
    supportService;
    constructor(supportService) {
        this.supportService = supportService;
    }
    async createTicket(req, data) {
        return this.supportService.createTicket(req.user.sub, data);
    }
    async getTickets(req, filters) {
        return this.supportService.getTickets(req.user.sub, req.user.role, filters);
    }
    async getTicket(id, req) {
        return this.supportService.getTicket(id, req.user.sub, req.user.role);
    }
    async addMessage(id, req, data) {
        return this.supportService.addMessage(id, req.user.sub, data);
    }
    async updateStatus(id, data) {
        return this.supportService.updateTicketStatus(id, data.status, data);
    }
    async assignTicket(id, data) {
        return this.supportService.assignTicket(id, data.assignedToId);
    }
    async rateTicket(id, req, data) {
        return this.supportService.rateTicket(id, req.user.sub, data.rating);
    }
    async getStats(filters) {
        return this.supportService.getTicketStats(filters);
    }
};
exports.SupportController = SupportController;
__decorate([
    (0, common_1.Post)('tickets'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Get)('tickets'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "getTickets", null);
__decorate([
    (0, common_1.Get)('tickets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "getTicket", null);
__decorate([
    (0, common_1.Post)('tickets/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "addMessage", null);
__decorate([
    (0, common_1.Patch)('tickets/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('tickets/:id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "assignTicket", null);
__decorate([
    (0, common_1.Post)('tickets/:id/rate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "rateTicket", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "getStats", null);
exports.SupportController = SupportController = __decorate([
    (0, common_1.Controller)('support'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [support_service_1.SupportService])
], SupportController);
//# sourceMappingURL=support.controller.js.map