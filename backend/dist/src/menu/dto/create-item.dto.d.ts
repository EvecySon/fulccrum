export declare class CreateItemDto {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    images?: string[];
    ingredients?: string[];
    allergens?: string[];
    nutritionalInfo?: any;
    preparationTime?: number;
    isAvailable?: boolean;
    isFeatured?: boolean;
    displayOrder?: number;
}
