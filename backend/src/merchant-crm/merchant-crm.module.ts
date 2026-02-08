import { Module } from '@nestjs/common';
import { MerchantCrmService } from './merchant-crm.service';
import { MerchantCrmController } from './merchant-crm.controller';

@Module({
  controllers: [MerchantCrmController],
  providers: [MerchantCrmService],
})
export class MerchantCrmModule {}
