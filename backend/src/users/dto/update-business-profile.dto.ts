import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class UpdateBusinessProfileDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  preparationTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrder?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;
}
