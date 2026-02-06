import { IsString, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  businessId: string;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  deliveryFee: number;

  @IsNumber()
  @Min(0)
  serviceFee: number;

  @IsNumber()
  @Min(0)
  taxAmount: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tipAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
