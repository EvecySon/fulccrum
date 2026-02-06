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
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        isActive: boolean;
        description: string | null;
        displayOrder: number;
    }>;
    getCategories(businessId: string, includeInactive?: boolean): Promise<({
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
    updateCategory(categoryId: string, businessId: string, dto: Partial<CreateCategoryDto>): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        isActive: boolean;
        description: string | null;
        displayOrder: number;
    }>;
    deleteCategory(categoryId: string, businessId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createItem(businessId: string, dto: CreateItemDto): Promise<{
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
    getItems(businessId: string, categoryId?: string, includeUnavailable?: boolean): Promise<({
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
    getItem(itemId: string): Promise<{
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
    updateItem(itemId: string, businessId: string, dto: Partial<CreateItemDto>): Promise<{
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
    deleteItem(itemId: string, businessId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleItemAvailability(itemId: string, businessId: string): Promise<{
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
    createModifier(businessId: string, dto: CreateModifierDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        businessId: string;
        type: string;
        displayOrder: number;
        isRequired: boolean;
    }>;
    getModifiers(businessId: string): Promise<({
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
    addModifierOption(modifierId: string, businessId: string, dto: CreateModifierOptionDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        displayOrder: number;
        isAvailable: boolean;
        priceAdjustment: import("@prisma/client-runtime-utils").Decimal;
        modifierId: string;
    }>;
    linkModifierToItem(itemId: string, modifierId: string, businessId: string): Promise<{
        id: string;
        createdAt: Date;
        modifierId: string;
        itemId: string;
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
