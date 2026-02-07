import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseDeliveryFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perKmRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minDeliveryFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDeliveryFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeDeliveryThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceFeePercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minServiceFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxServiceFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @IsOptional()
  @IsString()
  taxName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  platformCommissionPercentage?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
