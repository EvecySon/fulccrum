import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationTemplateController } from './notification-template.controller';
import { NotificationTemplateService } from './notification-template.service';
import { PushNotificationController } from './push-notification.controller';
import { PushNotificationService } from './push-notification.service';
import { ExpoPushService } from './expo-push.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    NotificationsController,
    NotificationTemplateController,
    PushNotificationController,
  ],
  providers: [
    NotificationsService,
    NotificationTemplateService,
    PushNotificationService,
    ExpoPushService,
  ],
  exports: [
    NotificationsService,
    NotificationTemplateService,
    PushNotificationService,
    ExpoPushService,
  ],
})
export class NotificationsModule {}
