import { Module } from '@nestjs/common';
import { MerchantPricingService } from './merchant-pricing.service';
import { MerchantPricingController } from './merchant-pricing.controller';

@Module({
  controllers: [MerchantPricingController],
  providers: [MerchantPricingService],
})
export class MerchantPricingModule {}
