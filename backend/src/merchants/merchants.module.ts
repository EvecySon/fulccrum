import { Module } from '@nestjs/common';
import { MerchantStatusService } from './merchant-status.service';
import { OrderTimeoutService } from './order-timeout.service';
import { MerchantStatusController, StoreStatusController } from './merchant-status.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule],
  controllers: [MerchantStatusController, StoreStatusController],
  providers: [MerchantStatusService, OrderTimeoutService],
  exports: [MerchantStatusService, OrderTimeoutService],
})
export class MerchantsModule {}
