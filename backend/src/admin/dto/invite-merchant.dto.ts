import { IsEmail, IsString, IsOptional, IsNumber } from 'class-validator';

export class InviteMerchantDto {
  @IsEmail()
  email!: string;

  @IsString()
  businessName!: string;

  @IsString()
  ownerName!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumber()
  commission?: number;
}
