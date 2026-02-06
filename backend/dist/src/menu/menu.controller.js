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
exports.MenuController = void 0;
const common_1 = require("@nestjs/common");
const menu_service_1 = require("./menu.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_category_dto_1 = require("./dto/create-category.dto");
const create_item_dto_1 = require("./dto/create-item.dto");
const create_modifier_dto_1 = require("./dto/create-modifier.dto");
const create_modifier_option_dto_1 = require("./dto/create-modifier-option.dto");
const update_inventory_dto_1 = require("./dto/update-inventory.dto");
let MenuController = class MenuController {
    menuService;
    constructor(menuService) {
        this.menuService = menuService;
    }
    async createCategory(req, dto) {
        return this.menuService.createCategory(req.user.sub, dto);
    }
    async getCategories(req, businessId, includeInactive) {
        const targetBusinessId = businessId || req.user.sub;
        return this.menuService.getCategories(targetBusinessId, includeInactive === 'true');
    }
    async updateCategory(id, req, dto) {
        return this.menuService.updateCategory(id, req.user.sub, dto);
    }
    async deleteCategory(id, req) {
        return this.menuService.deleteCategory(id, req.user.sub);
    }
    async createItem(req, dto) {
        return this.menuService.createItem(req.user.sub, dto);
    }
    async getItems(req, businessId, categoryId, includeUnavailable) {
        const targetBusinessId = businessId || req.user.sub;
        return this.menuService.getItems(targetBusinessId, categoryId, includeUnavailable === 'true');
    }
    async getItem(id) {
        return this.menuService.getItem(id);
    }
    async updateItem(id, req, dto) {
        return this.menuService.updateItem(id, req.user.sub, dto);
    }
    async toggleItemAvailability(id, req) {
        return this.menuService.toggleItemAvailability(id, req.user.sub);
    }
    async deleteItem(id, req) {
        return this.menuService.deleteItem(id, req.user.sub);
    }
    async createModifier(req, dto) {
        return this.menuService.createModifier(req.user.sub, dto);
    }
    async getModifiers(req, businessId) {
        const targetBusinessId = businessId || req.user.sub;
        return this.menuService.getModifiers(targetBusinessId);
    }
    async addModifierOption(id, req, dto) {
        return this.menuService.addModifierOption(id, req.user.sub, dto);
    }
    async linkModifierToItem(itemId, modifierId, req) {
        return this.menuService.linkModifierToItem(itemId, modifierId, req.user.sub);
    }
    async setBusinessHours(req, hours) {
        return this.menuService.setBusinessHours(req.user.sub, hours);
    }
    async getBusinessHours(req, businessId) {
        const targetBusinessId = businessId || req.user.sub;
        return this.menuService.getBusinessHours(targetBusinessId);
    }
    async isBusinessOpen(req, businessId) {
        const targetBusinessId = businessId || req.user.sub;
        return this.menuService.isBusinessOpen(targetBusinessId);
    }
    async updateInventory(itemId, req, dto) {
        return this.menuService.updateInventory(itemId, req.user.sub, dto);
    }
    async getInventory(req) {
        return this.menuService.getInventory(req.user.sub);
    }
    async getLowStockItems(req) {
        return this.menuService.getLowStockItems(req.user.sub);
    }
};
exports.MenuController = MenuController;
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('businessId')),
    __param(2, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Put)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_item_dto_1.CreateItemDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "createItem", null);
__decorate([
    (0, common_1.Get)('items'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('businessId')),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, common_1.Query)('includeUnavailable')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getItems", null);
__decorate([
    (0, common_1.Get)('items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getItem", null);
__decorate([
    (0, common_1.Put)('items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Patch)('items/:id/toggle-availability'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "toggleItemAvailability", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Post)('modifiers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_modifier_dto_1.CreateModifierDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "createModifier", null);
__decorate([
    (0, common_1.Get)('modifiers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getModifiers", null);
__decorate([
    (0, common_1.Post)('modifiers/:id/options'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_modifier_option_dto_1.CreateModifierOptionDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "addModifierOption", null);
__decorate([
    (0, common_1.Post)('items/:itemId/modifiers/:modifierId'),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Param)('modifierId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "linkModifierToItem", null);
__decorate([
    (0, common_1.Post)('business-hours'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "setBusinessHours", null);
__decorate([
    (0, common_1.Get)('business-hours'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getBusinessHours", null);
__decorate([
    (0, common_1.Get)('business-hours/is-open'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "isBusinessOpen", null);
__decorate([
    (0, common_1.Put)('inventory/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_inventory_dto_1.UpdateInventoryDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "updateInventory", null);
__decorate([
    (0, common_1.Get)('inventory'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Get)('inventory/low-stock'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getLowStockItems", null);
exports.MenuController = MenuController = __decorate([
    (0, common_1.Controller)('menu'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [menu_service_1.MenuService])
], MenuController);
//# sourceMappingURL=menu.controller.js.map