import { IsInt, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  currentStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimumStock?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;

  @IsOptional()
  @IsString()
  supplier?: string;
}
