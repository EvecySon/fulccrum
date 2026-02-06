import { IsInt, IsString, IsBoolean, IsOptional, Min, Max, Matches } from 'class-validator';

export class CreateBusinessHoursDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Opening time must be in HH:MM format' })
  openingTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Closing time must be in HH:MM format' })
  closingTime: string;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}
