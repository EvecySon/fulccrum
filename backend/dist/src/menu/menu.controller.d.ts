import { MenuService } from './menu.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateModifierDto } from './dto/create-modifier.dto';
import { CreateModifierOptionDto } from './dto/create-modifier-option.dto';
import { CreateBusinessHoursDto } from './dto/create-business-hours.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
export declare class MenuController {
    private menuService;
    constructor(menuService: MenuService);
    createCategory(req: any, dto: CreateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        isActive: boolean;
        description: string | null;
        displayOrder: number;
    }>;
    getCategories(req: any, businessId?: string, includeInactive?: string): Promise<({
        items: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            businessId: string;
            description: string | null;
            displayOrder: number;
            isAvailable: boolean;
            price: import("@prisma/client-runtime-utils").Decimal;
            costPrice: import("@prisma/client-runtime-utils").Decimal | null;
            images: import("@prisma/client/runtime/client").JsonValue;
            ingredients: string[];
            allergens: string[];
            nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
            preparationTime: number;
            isFeatured: boolean;
            categoryId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        isActive: boolean;
        description: string | null;
        displayOrder: number;
    })[]>;
    updateCategory(id: string, req: any, dto: Partial<CreateCategoryDto>): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        isActive: boolean;
        description: string | null;
        displayOrder: number;
    }>;
    deleteCategory(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    createItem(req: any, dto: CreateItemDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        description: string | null;
        displayOrder: number;
        isAvailable: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        ingredients: string[];
        allergens: string[];
        nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
        preparationTime: number;
        isFeatured: boolean;
        categoryId: string;
    }>;
    getItems(req: any, businessId?: string, categoryId?: string, includeUnavailable?: string): Promise<({
        inventory: {
            id: string;
            updatedAt: Date;
            businessId: string;
            itemId: string;
            currentStock: number;
            minimumStock: number;
            unit: string;
            costPerUnit: import("@prisma/client-runtime-utils").Decimal | null;
            supplier: string | null;
            lastRestocked: Date | null;
        } | null;
        category: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            businessId: string;
            isActive: boolean;
            description: string | null;
            displayOrder: number;
        };
        modifiers: ({
            modifier: {
                options: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    displayOrder: number;
                    isAvailable: boolean;
                    priceAdjustment: import("@prisma/client-runtime-utils").Decimal;
                    modifierId: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                businessId: string;
                type: string;
                displayOrder: number;
                isRequired: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            modifierId: string;
            itemId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        description: string | null;
        displayOrder: number;
        isAvailable: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        ingredients: string[];
        allergens: string[];
        nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
        preparationTime: number;
        isFeatured: boolean;
        categoryId: string;
    })[]>;
    getItem(id: string): Promise<{
        inventory: {
            id: string;
            updatedAt: Date;
            businessId: string;
            itemId: string;
            currentStock: number;
            minimumStock: number;
            unit: string;
            costPerUnit: import("@prisma/client-runtime-utils").Decimal | null;
            supplier: string | null;
            lastRestocked: Date | null;
        } | null;
        category: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            businessId: string;
            isActive: boolean;
            description: string | null;
            displayOrder: number;
        };
        modifiers: ({
            modifier: {
                options: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    displayOrder: number;
                    isAvailable: boolean;
                    priceAdjustment: import("@prisma/client-runtime-utils").Decimal;
                    modifierId: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                businessId: string;
                type: string;
                displayOrder: number;
                isRequired: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            modifierId: string;
            itemId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        description: string | null;
        displayOrder: number;
        isAvailable: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        ingredients: string[];
        allergens: string[];
        nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
        preparationTime: number;
        isFeatured: boolean;
        categoryId: string;
    }>;
    updateItem(id: string, req: any, dto: Partial<CreateItemDto>): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        description: string | null;
        displayOrder: number;
        isAvailable: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        ingredients: string[];
        allergens: string[];
        nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
        preparationTime: number;
        isFeatured: boolean;
        categoryId: string;
    }>;
    toggleItemAvailability(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        description: string | null;
        displayOrder: number;
        isAvailable: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        ingredients: string[];
        allergens: string[];
        nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
        preparationTime: number;
        isFeatured: boolean;
        categoryId: string;
    }>;
    deleteItem(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    createModifier(req: any, dto: CreateModifierDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        type: string;
        displayOrder: number;
        isRequired: boolean;
    }>;
    getModifiers(req: any, businessId?: string): Promise<({
        options: {
            id: string;
            createdAt: Date;
            name: string;
            displayOrder: number;
            isAvailable: boolean;
            priceAdjustment: import("@prisma/client-runtime-utils").Decimal;
            modifierId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        type: string;
        displayOrder: number;
        isRequired: boolean;
    })[]>;
    addModifierOption(id: string, req: any, dto: CreateModifierOptionDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        displayOrder: number;
        isAvailable: boolean;
        priceAdjustment: import("@prisma/client-runtime-utils").Decimal;
        modifierId: string;
    }>;
    linkModifierToItem(itemId: string, modifierId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        modifierId: string;
        itemId: string;
    }>;
    setBusinessHours(req: any, hours: CreateBusinessHoursDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getBusinessHours(req: any, businessId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        dayOfWeek: number;
        openingTime: string;
        closingTime: string;
        isClosed: boolean;
    }[]>;
    isBusinessOpen(req: any, businessId?: string): Promise<{
        isOpen: boolean;
        message: string;
        hours?: undefined;
    } | {
        isOpen: boolean;
        message: string;
        hours: {
            opening: string;
            closing: string;
        };
    }>;
    updateInventory(itemId: string, req: any, dto: UpdateInventoryDto): Promise<{
        id: string;
        updatedAt: Date;
        businessId: string;
        itemId: string;
        currentStock: number;
        minimumStock: number;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal | null;
        supplier: string | null;
        lastRestocked: Date | null;
    }>;
    getInventory(req: any): Promise<({
        item: {
            id: string;
            name: string;
            categoryId: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        businessId: string;
        itemId: string;
        currentStock: number;
        minimumStock: number;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal | null;
        supplier: string | null;
        lastRestocked: Date | null;
    })[]>;
    getLowStockItems(req: any): Promise<({
        item: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            businessId: string;
            description: string | null;
            displayOrder: number;
            isAvailable: boolean;
            price: import("@prisma/client-runtime-utils").Decimal;
            costPrice: import("@prisma/client-runtime-utils").Decimal | null;
            images: import("@prisma/client/runtime/client").JsonValue;
            ingredients: string[];
            allergens: string[];
            nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
            preparationTime: number;
            isFeatured: boolean;
            categoryId: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        businessId: string;
        itemId: string;
        currentStock: number;
        minimumStock: number;
        unit: string;
        costPerUnit: import("@prisma/client-runtime-utils").Decimal | null;
        supplier: string | null;
        lastRestocked: Date | null;
    })[]>;
}
