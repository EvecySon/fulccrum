import { IsString, Length, IsUUID } from 'class-validator';

export class ConfirmWithdrawalDto {
  @IsUUID()
  requestId: string;

  @IsString()
  @Length(6, 6)
  confirmationCode: string;
}
