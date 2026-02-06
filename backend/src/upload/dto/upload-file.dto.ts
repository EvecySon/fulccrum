import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @IsEnum(['profile', 'business_logo', 'business_cover', 'menu_item', 'document'])
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
