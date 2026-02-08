import { IsString } from 'class-validator';

export class SaveCardDto {
  @IsString()
  authorizationCode!: string;

  @IsString()
  cardType!: string;

  @IsString()
  last4!: string;

  @IsString()
  expMonth!: string;

  @IsString()
  expYear!: string;

  @IsString()
  bank!: string;
}
