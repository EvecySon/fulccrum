import { Module } from '@nestjs/common';
import { MerchantChannelsService } from './merchant-channels.service';
import { MerchantChannelsController } from './merchant-channels.controller';

@Module({
  controllers: [MerchantChannelsController],
  providers: [MerchantChannelsService],
})
export class MerchantChannelsModule {}
