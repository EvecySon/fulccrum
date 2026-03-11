import { Module } from '@nestjs/common';
import { PackageDeliveryController } from './package-delivery.controller';
import { PackageDeliveryService } from './package-delivery.service';
import { CourierMatchingService } from './courier-matching.service';
import { PricingService } from './pricing.service';
import { PackageDeliveryGateway } from './package-delivery.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [PackageDeliveryController],
  providers: [
    PackageDeliveryService,
    CourierMatchingService,
    PricingService,
    PackageDeliveryGateway,
  ],
  exports: [PackageDeliveryService],
})
export class PackageDeliveryModule {}
