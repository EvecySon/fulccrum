import { Module } from '@nestjs/common';
import { MerchantKitchenService } from './merchant-kitchen.service';
import { MerchantKitchenController } from './merchant-kitchen.controller';

@Module({
  controllers: [MerchantKitchenController],
  providers: [MerchantKitchenService],
})
export class MerchantKitchenModule {}
