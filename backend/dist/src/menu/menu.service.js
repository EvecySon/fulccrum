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
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MenuService = class MenuService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCategory(businessId, dto) {
        return this.prisma.menuCategory.create({
            data: {
                businessId,
                name: dto.name,
                description: dto.description,
                displayOrder: dto.displayOrder || 0,
                isActive: dto.isActive !== undefined ? dto.isActive : true,
            },
        });
    }
    async getCategories(businessId, includeInactive = false) {
        return this.prisma.menuCategory.findMany({
            where: {
                businessId,
                ...(includeInactive ? {} : { isActive: true }),
            },
            include: {
                items: {
                    where: includeInactive ? {} : { isAvailable: true },
                    orderBy: { displayOrder: 'asc' },
                },
            },
            orderBy: { displayOrder: 'asc' },
        });
    }
    async updateCategory(categoryId, businessId, dto) {
        const category = await this.prisma.menuCategory.findUnique({
            where: { id: categoryId },
        });
        if (!category || category.businessId !== businessId) {
            throw new common_1.ForbiddenException('Category not found or access denied');
        }
        return this.prisma.menuCategory.update({
            where: { id: categoryId },
            data: dto,
        });
    }
    async deleteCategory(categoryId, businessId) {
        const category = await this.prisma.menuCategory.findUnique({
            where: { id: categoryId },
        });
        if (!category || category.businessId !== businessId) {
            throw new common_1.ForbiddenException('Category not found or access denied');
        }
        await this.prisma.menuCategory.delete({
            where: { id: categoryId },
        });
        return { success: true, message: 'Category deleted successfully' };
    }
    async createItem(businessId, dto) {
        const category = await this.prisma.menuCategory.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category || category.businessId !== businessId) {
            throw new common_1.BadRequestException('Invalid category');
        }
        return this.prisma.menuItem.create({
            data: {
                businessId,
                categoryId: dto.categoryId,
                name: dto.name,
                description: dto.description,
                price: dto.price,
                costPrice: dto.costPrice,
                images: dto.images || [],
                ingredients: dto.ingredients || [],
                allergens: dto.allergens || [],
                nutritionalInfo: dto.nutritionalInfo,
                preparationTime: dto.preparationTime || 15,
                isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
                isFeatured: dto.isFeatured || false,
                displayOrder: dto.displayOrder || 0,
            },
        });
    }
    async getItems(businessId, categoryId, includeUnavailable = false) {
        return this.prisma.menuItem.findMany({
            where: {
                businessId,
                ...(categoryId ? { categoryId } : {}),
                ...(includeUnavailable ? {} : { isAvailable: true }),
            },
            include: {
                category: true,
                inventory: true,
                modifiers: {
                    include: {
                        modifier: {
                            include: {
                                options: true,
                            },
                        },
                    },
                },
            },
            orderBy: { displayOrder: 'asc' },
        });
    }
    async getItem(itemId) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id: itemId },
            include: {
                category: true,
                inventory: true,
                modifiers: {
                    include: {
                        modifier: {
                            include: {
                                options: true,
                            },
                        },
                    },
                },
            },
        });
        if (!item) {
            throw new common_1.BadRequestException('Item not found');
        }
        return item;
    }
    async updateItem(itemId, businessId, dto) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id: itemId },
        });
        if (!item || item.businessId !== businessId) {
            throw new common_1.ForbiddenException('Item not found or access denied');
        }
        return this.prisma.menuItem.update({
            where: { id: itemId },
            data: dto,
        });
    }
    async deleteItem(itemId, businessId) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id: itemId },
        });
        if (!item || item.businessId !== businessId) {
            throw new common_1.ForbiddenException('Item not found or access denied');
        }
        await this.prisma.menuItem.delete({
            where: { id: itemId },
        });
        return { success: true, message: 'Item deleted successfully' };
    }
    async toggleItemAvailability(itemId, businessId) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id: itemId },
        });
        if (!item || item.businessId !== businessId) {
            throw new common_1.ForbiddenException('Item not found or access denied');
        }
        return this.prisma.menuItem.update({
            where: { id: itemId },
            data: { isAvailable: !item.isAvailable },
        });
    }
    async createModifier(businessId, dto) {
        return this.prisma.itemModifier.create({
            data: {
                businessId,
                name: dto.name,
                type: dto.type,
                isRequired: dto.isRequired || false,
                displayOrder: dto.displayOrder || 0,
            },
        });
    }
    async getModifiers(businessId) {
        return this.prisma.itemModifier.findMany({
            where: { businessId },
            include: {
                options: {
                    orderBy: { displayOrder: 'asc' },
                },
            },
            orderBy: { displayOrder: 'asc' },
        });
    }
    async addModifierOption(modifierId, businessId, dto) {
        const modifier = await this.prisma.itemModifier.findUnique({
            where: { id: modifierId },
        });
        if (!modifier || modifier.businessId !== businessId) {
            throw new common_1.ForbiddenException('Modifier not found or access denied');
        }
        return this.prisma.modifierOption.create({
            data: {
                modifierId,
                name: dto.name,
                priceAdjustment: dto.priceAdjustment || 0,
                displayOrder: dto.displayOrder || 0,
                isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
            },
        });
    }
    async linkModifierToItem(itemId, modifierId, businessId) {
        const [item, modifier] = await Promise.all([
            this.prisma.menuItem.findUnique({ where: { id: itemId } }),
            this.prisma.itemModifier.findUnique({ where: { id: modifierId } }),
        ]);
        if (!item || item.businessId !== businessId) {
            throw new common_1.ForbiddenException('Item not found or access denied');
        }
        if (!modifier || modifier.businessId !== businessId) {
            throw new common_1.ForbiddenException('Modifier not found or access denied');
        }
        return this.prisma.itemModifierLink.create({
            data: {
                itemId,
                modifierId,
            },
        });
    }
    async setBusinessHours(businessId, hours) {
        await this.prisma.businessHours.deleteMany({
            where: { businessId },
        });
        return this.prisma.businessHours.createMany({
            data: hours.map((h) => ({
                businessId,
                dayOfWeek: h.dayOfWeek,
                openingTime: h.openingTime,
                closingTime: h.closingTime,
                isClosed: h.isClosed || false,
            })),
        });
    }
    async getBusinessHours(businessId) {
        return this.prisma.businessHours.findMany({
            where: { businessId },
            orderBy: { dayOfWeek: 'asc' },
        });
    }
    async isBusinessOpen(businessId) {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const hours = await this.prisma.businessHours.findUnique({
            where: {
                businessId_dayOfWeek: {
                    businessId,
                    dayOfWeek,
                },
            },
        });
        if (!hours || hours.isClosed) {
            return { isOpen: false, message: 'Closed today' };
        }
        const isOpen = currentTime >= hours.openingTime && currentTime <= hours.closingTime;
        return {
            isOpen,
            message: isOpen ? 'Open now' : `Opens at ${hours.openingTime}`,
            hours: {
                opening: hours.openingTime,
                closing: hours.closingTime,
            },
        };
    }
    async updateInventory(itemId, businessId, dto) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id: itemId },
        });
        if (!item || item.businessId !== businessId) {
            throw new common_1.ForbiddenException('Item not found or access denied');
        }
        return this.prisma.inventory.upsert({
            where: { itemId },
            create: {
                businessId,
                itemId,
                currentStock: dto.currentStock || 0,
                minimumStock: dto.minimumStock || 0,
                unit: dto.unit || 'pieces',
                costPerUnit: dto.costPerUnit,
                supplier: dto.supplier,
                lastRestocked: new Date(),
            },
            update: {
                ...dto,
                ...(dto.currentStock !== undefined ? { lastRestocked: new Date() } : {}),
            },
        });
    }
    async getLowStockItems(businessId) {
        return this.prisma.inventory.findMany({
            where: {
                businessId,
                currentStock: {
                    lte: this.prisma.inventory.fields.minimumStock,
                },
            },
            include: {
                item: true,
            },
        });
    }
    async getInventory(businessId) {
        return this.prisma.inventory.findMany({
            where: { businessId },
            include: {
                item: {
                    select: {
                        id: true,
                        name: true,
                        categoryId: true,
                    },
                },
            },
            orderBy: { currentStock: 'asc' },
        });
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuService);
//# sourceMappingURL=menu.service.js.map