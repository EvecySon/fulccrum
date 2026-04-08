import {
  IsObject,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  address: string;

  @IsString()
  contactName: string;

  @IsString()
  contactPhone: string;
}

export class RequestDeliveryDto {
  @ValidateNested()
  @Type(() => LocationDto)
  pickupLocation: LocationDto;

  @ValidateNested()
  @Type(() => LocationDto)
  dropoffLocation: LocationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  additionalStops?: LocationDto[];

  @IsEnum(['small', 'medium', 'large', 'extra_large'])
  packageSize: string;

  @IsEnum(['express', 'same_day', 'scheduled'])
  deliverySpeed: string;

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsOptional()
  @IsObject()
  dimensions?: { length?: number; width?: number; height?: number };

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  packageDescription?: string;

  @IsOptional()
  @IsNumber()
  packageWeight?: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsOptional()
  @IsEnum(['basic', 'standard', 'premium'])
  insuranceTier?: string;
}
