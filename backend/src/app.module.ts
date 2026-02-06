import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RealtimeModule } from './realtime/realtime.module';
import { OrdersModule } from './orders/orders.module';
import { WalletModule } from './wallet/wallet.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';
import { LocationModule } from './location/location.module';
import { PaymentModule } from './payment/payment.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { MessagingModule } from './messaging/messaging.module';
import { MenuModule } from './menu/menu.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CustomThrottlerGuard } from './common/guards/throttle.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute per user/IP
    }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    RealtimeModule,
    OrdersModule,
    WalletModule,
    NotificationsModule,
    UploadModule,
    LocationModule,
    PaymentModule,
    AnalyticsModule,
    AdminModule,
    MessagingModule,
    MenuModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
