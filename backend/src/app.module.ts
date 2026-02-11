import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
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
import { PromosModule } from './promos/promos.module';
import { FeesModule } from './fees/fees.module';
import { ZonesModule } from './zones/zones.module';
import { SupportModule } from './support/support.module';
import { SearchModule } from './search/search.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AddressesModule } from './addresses/addresses.module';
import { AiModule } from './ai/ai.module';
import { ArModule } from './ar/ar.module';
import { SocialModule } from './social/social.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { SustainabilityModule } from './sustainability/sustainability.module';
import { MerchantKitchenModule } from './merchant-kitchen/merchant-kitchen.module';
import { MerchantInsightsModule } from './merchant-insights/merchant-insights.module';
import { MerchantCrmModule } from './merchant-crm/merchant-crm.module';
import { FlashSalesModule } from './flash-sales/flash-sales.module';
import { MerchantChannelsModule } from './merchant-channels/merchant-channels.module';
import { MerchantPricingModule } from './merchant-pricing/merchant-pricing.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { CourierFleetModule } from './courier-fleet/courier-fleet.module';
import { CourierGamificationModule } from './courier-gamification/courier-gamification.module';
import { CourierSafetyModule } from './courier-safety/courier-safety.module';
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
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'dev-secret',
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '1h') as JwtSignOptions['expiresIn'],
          issuer: config.get<string>('JWT_ISSUER') ?? 'delivery-platform',
          audience: config.get<string>('JWT_AUDIENCE') ?? 'delivery-platform-app',
        } satisfies JwtSignOptions,
      }),
    }),
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
    PromosModule,
    FeesModule,
    ZonesModule,
    SupportModule,
    SearchModule,
    FavoritesModule,
    AddressesModule,
    AiModule,
    ArModule,
    SocialModule,
    BlockchainModule,
    SustainabilityModule,
    MerchantKitchenModule,
    MerchantInsightsModule,
    MerchantCrmModule,
    FlashSalesModule,
    MerchantChannelsModule,
    MerchantPricingModule,
    MarketplaceModule,
    CourierFleetModule,
    CourierGamificationModule,
    CourierSafetyModule,
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
