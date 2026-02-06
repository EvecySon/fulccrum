import { IsString, IsBoolean, IsOptional, IsInt, IsEnum, MaxLength } from 'class-validator';

export class CreateModifierDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(['single', 'multiple'])
  type: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
