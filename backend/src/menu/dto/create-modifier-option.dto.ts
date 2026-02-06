import { IsString, IsNumber, IsOptional, IsBoolean, IsInt, MaxLength } from 'class-validator';

export class CreateModifierOptionDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsNumber()
  priceAdjustment?: number;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
