import { IsObject, IsEnum, IsNotEmpty } from 'class-validator';

export class CalculatePriceDto {
  @IsObject()
  @IsNotEmpty()
  pickup: { lat: number; lng: number };

  @IsObject()
  @IsNotEmpty()
  dropoff: { lat: number; lng: number };

  @IsEnum(['small', 'medium', 'large'])
  size: string;

  @IsEnum(['express', 'same_day', 'scheduled'])
  speed: string;
}
