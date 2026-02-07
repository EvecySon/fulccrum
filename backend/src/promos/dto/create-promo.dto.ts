import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreatePromoDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['percentage', 'fixed'])
  discountType: string;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrder?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimitPerUser?: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsEnum(['all', 'first_order', 'specific_business'])
  applicableTo: string;

  @IsOptional()
  @IsString()
  businessId?: string;
}
