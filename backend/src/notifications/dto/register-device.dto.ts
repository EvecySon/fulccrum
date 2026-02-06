import { IsString, IsEnum, IsOptional } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  token: string;

  @IsEnum(['ios', 'android', 'web'])
  platform: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}
