import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class ValidatePromoDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  orderAmount: number;

  @IsOptional()
  @IsString()
  businessId?: string;
}
