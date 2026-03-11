import { IsOptional, IsString, IsNumber, IsEnum, IsArray } from 'class-validator';

export class SearchProductsDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsEnum(['new', 'refurbished', 'used_like_new', 'used_good', 'used_fair'])
  condition?: string;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @IsEnum(['price_asc', 'price_desc', 'rating', 'newest', 'popular'])
  sortBy?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
