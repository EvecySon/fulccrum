import { IsString, IsEmail, IsArray, IsOptional, IsNumber, IsObject } from 'class-validator';

export class RegisterRestaurantDto {
  @IsString()
  businessName: string;

  @IsString()
  restaurantType: string;

  @IsArray()
  @IsOptional()
  cuisineTypes?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsEmail()
  businessEmail: string;

  @IsString()
  businessPhone: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  @IsOptional()
  deliveryRadius?: number;

  @IsObject()
  @IsOptional()
  operatingHours?: any;

  @IsString()
  @IsOptional()
  foodLicense?: string;

  @IsString()
  @IsOptional()
  businessRegNumber?: string;

  @IsArray()
  @IsOptional()
  kitchenPhotos?: string[];

  @IsArray()
  menuItems: Array<{
    name: string;
    category: string;
    price: string;
    description?: string;
  }>;
}
