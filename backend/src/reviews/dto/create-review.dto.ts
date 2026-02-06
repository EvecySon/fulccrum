import { IsInt, IsString, IsOptional, IsArray, Min, Max, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  orderId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  foodQuality?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  serviceQuality?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  deliverySpeed?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  valueForMoney?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
