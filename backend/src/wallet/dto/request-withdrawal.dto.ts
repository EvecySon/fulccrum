import { IsNumber, Min, Max } from 'class-validator';

export class RequestWithdrawalDto {
  @IsNumber()
  @Min(1)
  @Max(10000)
  amount: number;
}
