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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getAllUsers(req, page, limit) {
        return this.adminService.getAllUsers(req.user.role, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
    async suspendUser(req, userId) {
        return this.adminService.suspendUser(req.user.role, userId);
    }
    async activateUser(req, userId) {
        return this.adminService.activateUser(req.user.role, userId);
    }
    async getAllOrders(req, page, limit) {
        return this.adminService.getAllOrders(req.user.role, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
    async getPlatformMetrics(req) {
        return this.adminService.getPlatformMetrics(req.user.role);
    }
    async getPendingWithdrawals(req, page, limit) {
        return this.adminService.getPendingWithdrawals(req.user.role, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
    async approveWithdrawal(req, withdrawalId) {
        return this.adminService.approveWithdrawal(req.user.role, withdrawalId);
    }
    async rejectWithdrawal(req, withdrawalId, reason) {
        return this.adminService.rejectWithdrawal(req.user.role, withdrawalId, reason);
    }
    async getRecentActivity(req, limit) {
        return this.adminService.getRecentActivity(req.user.role, limit ? parseInt(limit) : 20);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Patch)('users/:userId/suspend'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "suspendUser", null);
__decorate([
    (0, common_1.Patch)('users/:userId/activate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "activateUser", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPlatformMetrics", null);
__decorate([
    (0, common_1.Get)('withdrawals/pending'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingWithdrawals", null);
__decorate([
    (0, common_1.Post)('withdrawals/:withdrawalId/approve'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('withdrawalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveWithdrawal", null);
__decorate([
    (0, common_1.Post)('withdrawals/:withdrawalId/reject'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('withdrawalId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectWithdrawal", null);
__decorate([
    (0, common_1.Get)('activity'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRecentActivity", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map