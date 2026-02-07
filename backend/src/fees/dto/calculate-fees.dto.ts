import { IsNumber, IsString, IsOptional, IsUUID, Min } from 'class-validator';

export class CalculateFeesDto {
  @IsUUID()
  businessId: string;

  @IsUUID()
  customerAddressId: string;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsOptional()
  @IsString()
  promoCode?: string;
}
