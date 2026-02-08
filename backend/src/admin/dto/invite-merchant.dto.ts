import { IsEmail, IsString } from 'class-validator';

export class InviteMerchantDto {
  @IsEmail()
  email!: string;

  @IsString()
  businessName!: string;
}
