import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateModifierDto } from './dto/create-modifier.dto';
import { CreateModifierOptionDto } from './dto/create-modifier-option.dto';
import { CreateBusinessHoursDto } from './dto/create-business-hours.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // MENU CATEGORIES
  async createCategory(businessId: string, dto: CreateCategoryDto) {
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

  async getCategories(businessId: string, includeInactive = false) {
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

  async updateCategory(categoryId: string, businessId: string, dto: Partial<CreateCategoryDto>) {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.businessId !== businessId) {
      throw new ForbiddenException('Category not found or access denied');
    }

    return this.prisma.menuCategory.update({
      where: { id: categoryId },
      data: dto,
    });
  }

  async deleteCategory(categoryId: string, businessId: string) {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.businessId !== businessId) {
      throw new ForbiddenException('Category not found or access denied');
    }

    await this.prisma.menuCategory.delete({
      where: { id: categoryId },
    });

    return { success: true, message: 'Category deleted successfully' };
  }

  // MENU ITEMS
  async createItem(businessId: string, dto: CreateItemDto) {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category || category.businessId !== businessId) {
      throw new BadRequestException('Invalid category');
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

  async getItems(businessId: string, categoryId?: string, includeUnavailable = false) {
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

  async getItem(itemId: string) {
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
      throw new BadRequestException('Item not found');
    }

    return item;
  }

  async updateItem(itemId: string, businessId: string, dto: Partial<CreateItemDto>) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.businessId !== businessId) {
      throw new ForbiddenException('Item not found or access denied');
    }

    return this.prisma.menuItem.update({
      where: { id: itemId },
      data: dto,
    });
  }

  async deleteItem(itemId: string, businessId: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.businessId !== businessId) {
      throw new ForbiddenException('Item not found or access denied');
    }

    await this.prisma.menuItem.delete({
      where: { id: itemId },
    });

    return { success: true, message: 'Item deleted successfully' };
  }

  async toggleItemAvailability(itemId: string, businessId: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.businessId !== businessId) {
      throw new ForbiddenException('Item not found or access denied');
    }

    return this.prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable: !item.isAvailable },
    });
  }

  // MODIFIERS
  async createModifier(businessId: string, dto: CreateModifierDto) {
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

  async getModifiers(businessId: string) {
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

  async addModifierOption(modifierId: string, businessId: string, dto: CreateModifierOptionDto) {
    const modifier = await this.prisma.itemModifier.findUnique({
      where: { id: modifierId },
    });

    if (!modifier || modifier.businessId !== businessId) {
      throw new ForbiddenException('Modifier not found or access denied');
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

  async linkModifierToItem(itemId: string, modifierId: string, businessId: string) {
    const [item, modifier] = await Promise.all([
      this.prisma.menuItem.findUnique({ where: { id: itemId } }),
      this.prisma.itemModifier.findUnique({ where: { id: modifierId } }),
    ]);

    if (!item || item.businessId !== businessId) {
      throw new ForbiddenException('Item not found or access denied');
    }

    if (!modifier || modifier.businessId !== businessId) {
      throw new ForbiddenException('Modifier not found or access denied');
    }

    return this.prisma.itemModifierLink.create({
      data: {
        itemId,
        modifierId,
      },
    });
  }

  // BUSINESS HOURS
  async setBusinessHours(businessId: string, hours: CreateBusinessHoursDto[]) {
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

  async getBusinessHours(businessId: string) {
    return this.prisma.businessHours.findMany({
      where: { businessId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async isBusinessOpen(businessId: string) {
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

  // INVENTORY
  async updateInventory(itemId: string, businessId: string, dto: UpdateInventoryDto) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.businessId !== businessId) {
      throw new ForbiddenException('Item not found or access denied');
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

  async getLowStockItems(businessId: string) {
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

  async getInventory(businessId: string) {
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
}
