import { IsString, IsOptional } from 'class-validator';

export class VerifyDocumentDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectDocumentDto {
  @IsString()
  reason: string;
}
