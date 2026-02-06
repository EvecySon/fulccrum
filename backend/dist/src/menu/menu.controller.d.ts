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
        name: string;
        description: string | null;
        displayOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
    }>;
    getCategories(req: any, businessId?: string, includeInactive?: string): Promise<({
        items: {
            id: string;
            name: string;
            description: string | null;
            displayOrder: number;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            isAvailable: boolean;
            categoryId: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            costPrice: import("@prisma/client-runtime-utils").Decimal | null;
            images: import("@prisma/client/runtime/client").JsonValue;
            ingredients: string[];
            allergens: string[];
            nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
            preparationTime: number;
            isFeatured: boolean;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        displayOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
    })[]>;
    updateCategory(id: string, req: any, dto: Partial<CreateCategoryDto>): Promise<{
        id: string;
        name: string;
        description: string | null;
        displayOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
    }>;
    deleteCategory(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    createItem(req: any, dto: CreateItemDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        displayOrder: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        isAvailable: boolean;
        categoryId: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        ingredients: string[];
        allergens: string[];
        nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
        preparationTime: number;
        isFeatured: boolean;
    }>;
    getItems(req: any, businessId?: string, categoryId?: string, includeUnavailable?: string): Promise<({
        category: {
            id: string;
            name: string;
            description: string | null;
            displayOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
        };
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
        modifiers: ({
            modifier: {
                options: {
                    id: string;
                    name: string;
                    displayOrder: number;
                    createdAt: Date;
                    isAvailable: boolean;
                    modifierId: string;
                    priceAdjustment: import("@prisma/client-runtime-utils").Decimal;
                }[];
            } & {
                id: string;
                name: string;
                displayOrder: number;
                createdAt: Date;
                updatedAt: Date;
                businessId: string;
                type: string;
                isRequired: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            itemId: string;
            modifierId: string;
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        displayOrder: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        isAvailable: boolean;
        categoryId: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        ingredients: string[];
        allergens: string[];
        nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
        preparationTime: number;
        isFeatured: boolean;
    })[]>;
    getItem(id: string): Promise<{
        category: {
            id: string;
            name: string;
            description: string | null;
            displayOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
        };
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
        modifiers: ({
            modifier: {
                options: {
                    id: string;
                    name: string;
                    displayOrder: number;
                    createdAt: Date;
                    isAvailable: boolean;
                    modifierId: string;
                    priceAdjustment: import("@prisma/client-runtime-utils").Decimal;
                }[];
            } & {
                id: string;
                name: string;
                displayOrder: number;
                createdAt: Date;
                updatedAt: Date;
                businessId: string;
                type: string;
                isRequired: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            itemId: string;
            modifierId: string;
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        displayOrder: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        isAvailable: boolean;
        categoryId: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        ingredients: string[];
        allergens: string[];
        nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
        preparationTime: number;
        isFeatured: boolean;
    }>;
    updateItem(id: string, req: any, dto: Partial<CreateItemDto>): Promise<{
        id: string;
        name: string;
        description: string | null;
        displayOrder: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        isAvailable: boolean;
        categoryId: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        ingredients: string[];
        allergens: string[];
        nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
        preparationTime: number;
        isFeatured: boolean;
    }>;
    toggleItemAvailability(id: string, req: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        displayOrder: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        isAvailable: boolean;
        categoryId: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        ingredients: string[];
        allergens: string[];
        nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
        preparationTime: number;
        isFeatured: boolean;
    }>;
    deleteItem(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    createModifier(req: any, dto: CreateModifierDto): Promise<{
        id: string;
        name: string;
        displayOrder: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        type: string;
        isRequired: boolean;
    }>;
    getModifiers(req: any, businessId?: string): Promise<({
        options: {
            id: string;
            name: string;
            displayOrder: number;
            createdAt: Date;
            isAvailable: boolean;
            modifierId: string;
            priceAdjustment: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
        id: string;
        name: string;
        displayOrder: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        type: string;
        isRequired: boolean;
    })[]>;
    addModifierOption(id: string, req: any, dto: CreateModifierOptionDto): Promise<{
        id: string;
        name: string;
        displayOrder: number;
        createdAt: Date;
        isAvailable: boolean;
        modifierId: string;
        priceAdjustment: import("@prisma/client-runtime-utils").Decimal;
    }>;
    linkModifierToItem(itemId: string, modifierId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        itemId: string;
        modifierId: string;
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
            name: string;
            description: string | null;
            displayOrder: number;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            isAvailable: boolean;
            categoryId: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            costPrice: import("@prisma/client-runtime-utils").Decimal | null;
            images: import("@prisma/client/runtime/client").JsonValue;
            ingredients: string[];
            allergens: string[];
            nutritionalInfo: import("@prisma/client/runtime/client").JsonValue | null;
            preparationTime: number;
            isFeatured: boolean;
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
