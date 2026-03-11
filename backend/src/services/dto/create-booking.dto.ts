import { IsEnum, IsString, IsObject, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  providerId: string;

  @IsEnum(['home_service', 'health_service', 'beauty_service', 'repair_service'])
  serviceType: string;

  @IsEnum([
    'cleaning', 'plumbing', 'electrical', 'carpentry', 'painting', 'pest_control',
    'doctor_consultation', 'nursing', 'physiotherapy', 'lab_test',
    'hair_styling', 'makeup', 'spa', 'massage',
    'appliance_repair', 'phone_repair', 'computer_repair', 'other'
  ])
  category: string;

  @IsObject()
  serviceDetails: any;

  @IsDateString()
  scheduledDate: string;

  @IsString()
  scheduledTime: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsObject()
  location: any;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  specialNotes?: string;
}
