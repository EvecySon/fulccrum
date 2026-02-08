import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class AddBankAccountDto {
  @IsString()
  @MinLength(2)
  accountName!: string;

  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Account number must be 10 digits' })
  accountNumber!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(10)
  bankCode!: string;

  @IsString()
  bankName!: string;
}
