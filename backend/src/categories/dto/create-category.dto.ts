import { IsString, IsBoolean, IsInt, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  key: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  label: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  icon: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
