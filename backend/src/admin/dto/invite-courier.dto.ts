import { IsEmail, IsString } from 'class-validator';

export class InviteCourierDto {
  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;
}
