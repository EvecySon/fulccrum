import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsEnum(['order_update', 'delivery_update', 'payment_update', 'promotion', 'system_alert', 'support_message', 'review_request'])
  type: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
