import { IsEnum, IsOptional, IsNumber, IsObject } from 'class-validator';

export class SearchProvidersDto {
  @IsEnum(['home_service', 'health_service', 'beauty_service', 'repair_service'])
  serviceType: string;

  @IsOptional()
  @IsEnum([
    'cleaning', 'plumbing', 'electrical', 'carpentry', 'painting', 'pest_control',
    'doctor_consultation', 'nursing', 'physiotherapy', 'lab_test',
    'hair_styling', 'makeup', 'spa', 'massage',
    'appliance_repair', 'phone_repair', 'computer_repair', 'other'
  ])
  category?: string;

  @IsOptional()
  @IsObject()
  location?: { lat: number; lng: number };

  @IsOptional()
  @IsNumber()
  maxDistance?: number;

  @IsOptional()
  @IsNumber()
  minRating?: number;
}
