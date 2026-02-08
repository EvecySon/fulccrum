import { IsEmail, IsEnum } from 'class-validator';

export class RegisterPaymentDto {
  @IsEmail()
  email!: string;

  @IsEnum(['business_owner', 'driver'])
  role!: 'business_owner' | 'driver';
}
