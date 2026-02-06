import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'accepted', 'rejected', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'refunded'])
  status: string;

  @IsOptional()
  @IsUUID()
  driverId?: string;
}
