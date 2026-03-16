import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePackagePricingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePackagePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perKmPackageRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packageSizeSmallMultiplier?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packageSizeMediumMultiplier?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packageSizeLargeMultiplier?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expressSpeedMultiplier?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sameDaySpeedMultiplier?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  scheduledSpeedMultiplier?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  peakHourSurgeMultiplier?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weekendSurgeMultiplier?: number;
}
