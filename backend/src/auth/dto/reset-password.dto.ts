import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  resetToken!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
