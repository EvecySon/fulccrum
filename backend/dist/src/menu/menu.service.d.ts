import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateModifierDto } from './dto/create-modifier.dto';
import { CreateModifierOptionDto } from './dto/create-modifier-option.dto';
import { CreateBusinessHoursDto } from './dto/create-business-hours.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    createCategory(businessId: string, dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        displayOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
    }>;
    getCategories(businessId: string, includeInactive?: boolean): Promise<({
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
    updateCategory(categoryId: string, businessId: string, dto: Partial<CreateCategoryDto>): Promise<{
        id: string;
        name: string;
        description: string | null;
        displayOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
    }>;
    deleteCategory(categoryId: string, businessId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createItem(businessId: string, dto: CreateItemDto): Promise<{
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
    getItems(businessId: string, categoryId?: string, includeUnavailable?: boolean): Promise<({
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
    getItem(itemId: string): Promise<{
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
    updateItem(itemId: string, businessId: string, dto: Partial<CreateItemDto>): Promise<{
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
    deleteItem(itemId: string, businessId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleItemAvailability(itemId: string, businessId: string): Promise<{
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
    createModifier(businessId: string, dto: CreateModifierDto): Promise<{
        id: string;
        name: string;
        displayOrder: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        type: string;
        isRequired: boolean;
    }>;
    getModifiers(businessId: string): Promise<({
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
    addModifierOption(modifierId: string, businessId: string, dto: CreateModifierOptionDto): Promise<{
        id: string;
        name: string;
        displayOrder: number;
        createdAt: Date;
        isAvailable: boolean;
        modifierId: string;
        priceAdjustment: import("@prisma/client-runtime-utils").Decimal;
    }>;
    linkModifierToItem(itemId: string, modifierId: string, businessId: string): Promise<{
        id: string;
        createdAt: Date;
        itemId: string;
        modifierId: string;
    }>;
    setBusinessHours(businessId: string, hours: CreateBusinessHoursDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getBusinessHours(businessId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        dayOfWeek: number;
        openingTime: string;
        closingTime: string;
        isClosed: boolean;
    }[]>;
    isBusinessOpen(businessId: string): Promise<{
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
    updateInventory(itemId: string, businessId: string, dto: UpdateInventoryDto): Promise<{
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
    getLowStockItems(businessId: string): Promise<({
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
    getInventory(businessId: string): Promise<({
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
}
