import {
  IsObject,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
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

  @IsEnum(['small', 'medium', 'large'])
  packageSize: string;

  @IsEnum(['express', 'same_day', 'scheduled'])
  deliverySpeed: string;

  @IsOptional()
  @IsString()
  packageDescription?: string;

  @IsOptional()
  @IsNumber()
  packageWeight?: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}
