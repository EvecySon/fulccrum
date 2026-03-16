import { Module, forwardRef } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ScheduledOrdersService } from './scheduled-orders.service';
import { PickupOrdersService } from './pickup-orders.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => WalletModule), forwardRef(() => RealtimeModule), ReferralsModule],
  controllers: [OrdersController],
  providers: [OrdersService, ScheduledOrdersService, PickupOrdersService],
  exports: [OrdersService, ScheduledOrdersService, PickupOrdersService],
})
export class OrdersModule {}
