import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ApproveCourierDto {
  @IsBoolean()
  approved!: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
