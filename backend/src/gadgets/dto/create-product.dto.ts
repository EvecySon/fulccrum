import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';

export class CreateProductDto {
  @IsString()
  categoryId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsEnum(['new', 'refurbished', 'used_like_new', 'used_good', 'used_fair'])
  condition: string;

  @IsNumber()
  basePrice: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsNumber()
  stockQuantity: number;

  @IsArray()
  images: string[];

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsObject()
  specifications?: any;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsObject()
  dimensions?: any;
}
