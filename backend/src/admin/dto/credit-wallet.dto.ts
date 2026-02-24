import { IsUUID, IsNumber, IsString, Min, Max, IsOptional, IsEnum } from 'class-validator';

export class CreditWalletDto {
  @IsUUID()
  userId: string;

  @IsNumber()
  @Min(1)
  @Max(1000000)
  amount: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

export class DebitWalletDto {
  @IsUUID()
  userId: string;

  @IsNumber()
  @Min(1)
  @Max(1000000)
  amount: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

export enum WalletActionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  FREEZE = 'freeze',
  UNFREEZE = 'unfreeze',
}

export class ApproveWalletActionDto {
  @IsUUID()
  actionId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectWalletActionDto {
  @IsUUID()
  actionId: string;

  @IsString()
  reason: string;
}
