import { Module } from '@nestjs/common';
import { MerchantInsightsService } from './merchant-insights.service';
import { MerchantInsightsController } from './merchant-insights.controller';

@Module({
  controllers: [MerchantInsightsController],
  providers: [MerchantInsightsService],
})
export class MerchantInsightsModule {}
