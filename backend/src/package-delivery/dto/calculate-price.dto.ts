import { IsObject, IsEnum, IsNotEmpty, IsOptional, IsArray, IsString } from 'class-validator';

export class CalculatePriceDto {
  @IsObject()
  @IsNotEmpty()
  pickup: { lat: number; lng: number };

  @IsObject()
  @IsNotEmpty()
  dropoff: { lat: number; lng: number };

  @IsEnum(['small', 'medium', 'large', 'extra_large'])
  size: string;

  @IsEnum(['express', 'same_day', 'scheduled'])
  speed: string;

  @IsOptional()
  @IsArray()
  additionalStops?: { lat: number; lng: number }[];

  @IsOptional()
  @IsString()
  insuranceTier?: string;
}
