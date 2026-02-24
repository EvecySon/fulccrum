import { IsUUID } from 'class-validator';

export class PayWithWalletDto {
  @IsUUID()
  orderId: string;
}
