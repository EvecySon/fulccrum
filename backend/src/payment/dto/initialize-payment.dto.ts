import { IsString, IsNumber, Min, IsUUID } from 'class-validator';

export class InitializePaymentDto {
  @IsUUID()
  orderId: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
