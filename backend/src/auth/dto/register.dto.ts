import { IsEmail, IsEnum, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&/#^()\-_=+])[A-Za-z\d@$!%*?&/#^()\-_=+]{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  referredByCode?: string;

  @IsOptional()
  @IsEnum(['customer', 'business_owner', 'driver', 'admin'])
  role?: 'customer' | 'business_owner' | 'driver' | 'admin';
}
