import { IsEnum, IsString, IsArray, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateProviderDto {
  @IsEnum(['home_service', 'health_service', 'beauty_service', 'repair_service'])
  serviceType: string;

  @IsArray()
  categories: string[];

  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  experience?: number;

  @IsOptional()
  @IsArray()
  certifications?: any[];

  @IsObject()
  serviceArea: any;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsObject()
  fixedRates?: any;

  @IsOptional()
  @IsObject()
  availability?: any;
}
