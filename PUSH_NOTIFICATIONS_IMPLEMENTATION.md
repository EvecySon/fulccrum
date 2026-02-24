# 🔔 Push Notifications Implementation Guide (FCM)

## Overview

This guide shows how to add Firebase Cloud Messaging (FCM) for push notifications to your existing NestJS + PostgreSQL + React Native (Expo) stack **without migrating** to Firebase.

**What We're Adding:**
- ✅ Push notifications via FCM
- ✅ In-app messaging (optional)
- ✅ Analytics (optional)

**What We're Keeping:**
- ✅ NestJS backend
- ✅ PostgreSQL database
- ✅ JWT authentication
- ✅ All existing code

---

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Expo Push Notifications (expo-notifications)    │  │
│  │  + Firebase SDK (for FCM token)                  │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│                   FCM Token                             │
│                         ↓                               │
└─────────────────────────┼───────────────────────────────┘
                          ↓
┌─────────────────────────┼───────────────────────────────┐
│                   NestJS Backend                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  NotificationService                             │  │
│  │  - Store FCM tokens in PostgreSQL                │  │
│  │  - Send notifications via FCM Admin SDK          │  │
│  │  - Trigger on events (order, delivery, etc.)     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          ↓
                   Firebase Cloud Messaging
                          ↓
                    User's Device
```

---

## 🚀 Implementation Steps

### **Phase 1: Firebase Project Setup** (15 minutes)

#### **Step 1: Create/Configure Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. You already have project: `fulccrum-15c7a`
3. Click on your project
4. Add apps:
   - Click "Add app" → iOS
   - Click "Add app" → Android
   - Click "Add app" → Web (optional)

#### **Step 2: Get Configuration Files**

**For Android:**
1. Register app with package name: `com.fulccrum.app` (or your package name)
2. Download `google-services.json`
3. Place in: `frontend/android/app/google-services.json`

**For iOS:**
1. Register app with bundle ID: `com.fulccrum.app` (or your bundle ID)
2. Download `GoogleService-Info.plist`
3. Place in: `frontend/ios/GoogleService-Info.plist`

#### **Step 3: Get Server Key (for Backend)**

1. In Firebase Console → Project Settings → Cloud Messaging
2. Copy **Server Key** (legacy) or **Service Account JSON**
3. Save for backend configuration

---

### **Phase 2: Database Schema Update** (5 minutes)

Add push token storage to user model:

**File:** `backend/prisma/schema.prisma`

```prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  // ... existing fields ...
  
  // Add these fields for push notifications
  pushTokens        PushToken[]
  notificationSettings NotificationSettings?
  
  // ... rest of model ...
}

model PushToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  platform  String   // 'ios' | 'android' | 'web'
  deviceId  String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lastUsed  DateTime @default(now())

  @@index([userId])
  @@index([token])
}

model NotificationSettings {
  id                    String   @id @default(uuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Notification preferences
  orderUpdates          Boolean  @default(true)
  deliveryUpdates       Boolean  @default(true)
  promotions            Boolean  @default(true)
  newRestaurants        Boolean  @default(true)
  driverAssigned        Boolean  @default(true)
  orderDelivered        Boolean  @default(true)
  paymentConfirmation   Boolean  @default(true)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

**Run migration:**
```bash
cd backend
npx prisma migrate dev --name add_push_notifications
```

---

### **Phase 3: Backend Implementation** (1-2 hours)

#### **Step 1: Install Dependencies**

```bash
cd backend
npm install firebase-admin
npm install @nestjs/config
```

#### **Step 2: Add Firebase Admin Configuration**

**File:** `backend/src/config/firebase.config.ts`

```typescript
export default () => ({
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'fulccrum-15c7a',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Or use service account JSON file path
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  },
});
```

**File:** `backend/.env`

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=fulccrum-15c7a
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@fulccrum-15c7a.iam.gserviceaccount.com

# Or use service account file
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

#### **Step 3: Create Firebase Service**

**File:** `backend/src/notifications/firebase.service.ts`

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const serviceAccountPath = this.configService.get<string>(
      'firebase.serviceAccountPath',
    );

    if (serviceAccountPath) {
      // Initialize with service account file
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
    } else {
      // Initialize with environment variables
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>('firebase.projectId'),
          privateKey: this.configService.get<string>('firebase.privateKey'),
          clientEmail: this.configService.get<string>('firebase.clientEmail'),
        }),
      });
    }
  }

  getMessaging() {
    return admin.messaging(this.app);
  }
}
```

#### **Step 4: Create Notification Service**

**File:** `backend/src/notifications/notifications.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from './firebase.service';
import { Message, MulticastMessage } from 'firebase-admin/messaging';

export interface SendNotificationDto {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  sound?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
  ) {}

  // Register push token
  async registerPushToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceId?: string,
  ) {
    try {
      // Check if token already exists
      const existing = await this.prisma.pushToken.findUnique({
        where: { token },
      });

      if (existing) {
        // Update existing token
        return await this.prisma.pushToken.update({
          where: { token },
          data: {
            userId,
            platform,
            deviceId,
            isActive: true,
            lastUsed: new Date(),
          },
        });
      }

      // Create new token
      return await this.prisma.pushToken.create({
        data: {
          userId,
          token,
          platform,
          deviceId,
          isActive: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to register push token: ${error.message}`);
      throw error;
    }
  }

  // Remove push token
  async removePushToken(token: string) {
    return await this.prisma.pushToken.update({
      where: { token },
      data: { isActive: false },
    });
  }

  // Get user's active push tokens
  async getUserPushTokens(userId: string) {
    return await this.prisma.pushToken.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  // Send notification to single user
  async sendToUser(dto: SendNotificationDto) {
    try {
      const tokens = await this.getUserPushTokens(dto.userId);

      if (tokens.length === 0) {
        this.logger.warn(`No push tokens found for user ${dto.userId}`);
        return { success: false, message: 'No push tokens found' };
      }

      const message: MulticastMessage = {
        tokens: tokens.map((t) => t.token),
        notification: {
          title: dto.title,
          body: dto.body,
          imageUrl: dto.imageUrl,
        },
        data: dto.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: dto.sound || 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: dto.sound || 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.firebaseService
        .getMessaging()
        .sendEachForMulticast(message);

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx].token);
            this.logger.error(
              `Failed to send to token ${tokens[idx].token}: ${resp.error}`,
            );
          }
        });

        // Deactivate invalid tokens
        await this.prisma.pushToken.updateMany({
          where: { token: { in: failedTokens } },
          data: { isActive: false },
        });
      }

      this.logger.log(
        `Sent notification to user ${dto.userId}: ${response.successCount}/${tokens.length} successful`,
      );

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  // Send notification to multiple users
  async sendToUsers(userIds: string[], title: string, body: string, data?: Record<string, string>) {
    const results = await Promise.allSettled(
      userIds.map((userId) =>
        this.sendToUser({ userId, title, body, data }),
      ),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { successful, failed, total: userIds.length };
  }

  // Notification templates for different events
  async sendOrderPlacedNotification(userId: string, orderNumber: string) {
    return this.sendToUser({
      userId,
      title: '🎉 Order Placed!',
      body: `Your order ${orderNumber} has been placed successfully.`,
      data: {
        type: 'order_placed',
        orderNumber,
      },
    });
  }

  async sendOrderAcceptedNotification(userId: string, orderNumber: string, restaurantName: string) {
    return this.sendToUser({
      userId,
      title: '✅ Order Accepted',
      body: `${restaurantName} is preparing your order ${orderNumber}.`,
      data: {
        type: 'order_accepted',
        orderNumber,
      },
    });
  }

  async sendDriverAssignedNotification(userId: string, orderNumber: string, driverName: string) {
    return this.sendToUser({
      userId,
      title: '🚗 Driver Assigned',
      body: `${driverName} is on the way to pick up your order ${orderNumber}.`,
      data: {
        type: 'driver_assigned',
        orderNumber,
      },
    });
  }

  async sendOrderPickedUpNotification(userId: string, orderNumber: string, driverName: string) {
    return this.sendToUser({
      userId,
      title: '📦 Order Picked Up',
      body: `${driverName} has picked up your order and is heading your way!`,
      data: {
        type: 'order_picked_up',
        orderNumber,
      },
    });
  }

  async sendOrderDeliveredNotification(userId: string, orderNumber: string) {
    return this.sendToUser({
      userId,
      title: '🎊 Order Delivered!',
      body: `Your order ${orderNumber} has been delivered. Enjoy your meal!`,
      data: {
        type: 'order_delivered',
        orderNumber,
      },
    });
  }

  async sendPromotionNotification(userId: string, title: string, message: string, promoCode?: string) {
    return this.sendToUser({
      userId,
      title: `🎁 ${title}`,
      body: message,
      data: {
        type: 'promotion',
        promoCode: promoCode || '',
      },
    });
  }

  // Marketing & Engagement Notifications
  async sendEngagementNotification(userId: string, message: string) {
    const engagementMessages = [
      { title: '😋 Hungry Yet?', body: 'Time to order something hot and delicious!' },
      { title: '🍕 Wake Up!', body: "Today won't order itself. Let's get you something tasty!" },
      { title: '🔥 Craving Alert!', body: "Aren't you hungry yet? Your favorite meals are waiting!" },
      { title: '⏰ Meal Time!', body: 'Perfect time to order something hot and fresh!' },
      { title: '🌟 Treat Yourself!', body: 'You deserve something delicious today!' },
      { title: '🍔 Lunch Time?', body: "Don't skip meals! Order now and satisfy those cravings!" },
      { title: '🌮 Dinner Reminder', body: 'Evening hunger calling? Get your favorite meal delivered!' },
    ];

    const randomMessage = engagementMessages[Math.floor(Math.random() * engagementMessages.length)];

    return this.sendToUser({
      userId,
      title: randomMessage.title,
      body: message || randomMessage.body,
      data: {
        type: 'engagement',
        action: 'browse_restaurants',
      },
    });
  }

  async sendInactiveUserNotification(userId: string, daysSinceLastOrder: number) {
    const messages = [
      { title: '😢 We Miss You!', body: `It's been ${daysSinceLastOrder} days! Come back for your favorites!` },
      { title: '🎁 Special Offer Inside', body: 'We saved something special for you. Check it out!' },
      { title: '👋 Long Time No See', body: `${daysSinceLastOrder} days without your favorite meal? Let's fix that!` },
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    return this.sendToUser({
      userId,
      title: message.title,
      body: message.body,
      data: {
        type: 're_engagement',
        daysSinceLastOrder: daysSinceLastOrder.toString(),
      },
    });
  }

  async sendMealTimeReminder(userId: string, mealType: 'breakfast' | 'lunch' | 'dinner') {
    const mealMessages = {
      breakfast: {
        title: '🌅 Good Morning!',
        body: 'Start your day right with a delicious breakfast!',
      },
      lunch: {
        title: '☀️ Lunch Time!',
        body: "It's lunch o'clock! Order something hot and tasty!",
      },
      dinner: {
        title: '🌙 Dinner Time!',
        body: 'End your day with a satisfying meal delivered to you!',
      },
    };

    const message = mealMessages[mealType];

    return this.sendToUser({
      userId,
      title: message.title,
      body: message.body,
      data: {
        type: 'meal_reminder',
        mealType,
      },
    });
  }

  // Merchant/Restaurant Notifications
  async sendMerchantStoreReminderNotification(userId: string, restaurantName: string) {
    const reminderMessages = [
      { title: '🏪 Time to Open!', body: "Don't keep people hungry! Your customers are waiting." },
      { title: '👨‍🍳 Ready to Cook?', body: "It's time to open your store and serve delicious meals!" },
      { title: '⏰ Store Opening Time', body: 'Your hungry customers are looking for you. Time to open!' },
      { title: '🍽️ People Are Hungry!', body: "Don't forget to open your store and start serving!" },
      { title: '📱 Open Your Store', body: 'Customers are waiting! Open now and start earning.' },
    ];

    const message = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];

    return this.sendToUser({
      userId,
      title: message.title,
      body: message.body,
      data: {
        type: 'merchant_reminder',
        action: 'open_store',
        restaurantName,
      },
    });
  }

  async sendMerchantClosingReminderNotification(userId: string, restaurantName: string) {
    return this.sendToUser({
      userId,
      title: '🔔 Closing Time Reminder',
      body: "Don't forget to close your store and update your status!",
      data: {
        type: 'merchant_reminder',
        action: 'close_store',
        restaurantName,
      },
    });
  }

  async sendMerchantNewOrdersAvailableNotification(userId: string, pendingOrdersCount: number) {
    return this.sendToUser({
      userId,
      title: '🛎️ Orders Waiting!',
      body: `You have ${pendingOrdersCount} pending ${pendingOrdersCount === 1 ? 'order' : 'orders'}. Don't keep customers waiting!`,
      data: {
        type: 'merchant_alert',
        action: 'view_orders',
        pendingOrdersCount: pendingOrdersCount.toString(),
      },
    });
  }

  async sendMerchantDailySummaryNotification(userId: string, ordersToday: number, earningsToday: number) {
    return this.sendToUser({
      userId,
      title: '📊 Daily Summary',
      body: `Today: ${ordersToday} orders, ₦${earningsToday.toLocaleString()} earned. Great job!`,
      data: {
        type: 'merchant_summary',
        ordersToday: ordersToday.toString(),
        earningsToday: earningsToday.toString(),
      },
    });
  }

  // Driver Engagement Notifications
  async sendDriverShiftReminderNotification(userId: string) {
    return this.sendToUser({
      userId,
      title: '🚗 Ready to Earn?',
      body: 'Go online and start accepting deliveries!',
      data: {
        type: 'driver_reminder',
        action: 'go_online',
      },
    });
  }

  async sendDriverPeakHoursNotification(userId: string, expectedEarnings: number) {
    return this.sendToUser({
      userId,
      title: '🔥 Peak Hours Alert!',
      body: `High demand now! Earn up to ₦${expectedEarnings.toLocaleString()} per hour!`,
      data: {
        type: 'driver_peak_hours',
        expectedEarnings: expectedEarnings.toString(),
      },
    });
  }
}
```

#### **Step 5: Create Notification Controller**

**File:** `backend/src/notifications/notifications.controller.ts`

```typescript
import { Controller, Post, Delete, Body, UseGuards, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('register-token')
  async registerToken(
    @CurrentUser() user: any,
    @Body() body: { token: string; platform: 'ios' | 'android' | 'web'; deviceId?: string },
  ) {
    return this.notificationsService.registerPushToken(
      user.id,
      body.token,
      body.platform,
      body.deviceId,
    );
  }

  @Delete('remove-token')
  async removeToken(@Body() body: { token: string }) {
    return this.notificationsService.removePushToken(body.token);
  }

  @Get('tokens')
  async getTokens(@CurrentUser() user: any) {
    return this.notificationsService.getUserPushTokens(user.id);
  }
}
```

#### **Step 6: Create Notifications Module**

**File:** `backend/src/notifications/notifications.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { FirebaseService } from './firebase.service';
import { PrismaModule } from '../prisma/prisma.module';
import firebaseConfig from '../config/firebase.config';

@Module({
  imports: [
    ConfigModule.forFeature(firebaseConfig),
    PrismaModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, FirebaseService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

#### **Step 7: Update App Module**

**File:** `backend/src/app.module.ts`

```typescript
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // ... existing imports ...
    NotificationsModule,
  ],
  // ...
})
export class AppModule {}
```

#### **Step 8: Create Scheduled Notifications Service**

**File:** `backend/src/notifications/scheduled-notifications.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class ScheduledNotificationsService {
  private readonly logger = new Logger(ScheduledNotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Send meal time reminders
  @Cron('0 8 * * *') // 8:00 AM daily - Breakfast
  async sendBreakfastReminders() {
    this.logger.log('Sending breakfast reminders...');
    const users = await this.getActiveCustomers();
    
    for (const user of users) {
      if (user.notificationSettings?.orderUpdates) {
        await this.notificationsService.sendMealTimeReminder(user.id, 'breakfast');
      }
    }
  }

  @Cron('0 12 * * *') // 12:00 PM daily - Lunch
  async sendLunchReminders() {
    this.logger.log('Sending lunch reminders...');
    const users = await this.getActiveCustomers();
    
    for (const user of users) {
      if (user.notificationSettings?.orderUpdates) {
        await this.notificationsService.sendMealTimeReminder(user.id, 'lunch');
      }
    }
  }

  @Cron('0 18 * * *') // 6:00 PM daily - Dinner
  async sendDinnerReminders() {
    this.logger.log('Sending dinner reminders...');
    const users = await this.getActiveCustomers();
    
    for (const user of users) {
      if (user.notificationSettings?.orderUpdates) {
        await this.notificationsService.sendMealTimeReminder(user.id, 'dinner');
      }
    }
  }

  // Send engagement notifications to random users
  @Cron('0 10,15,20 * * *') // 10 AM, 3 PM, 8 PM daily
  async sendEngagementNotifications() {
    this.logger.log('Sending engagement notifications...');
    
    // Get users who haven't ordered today
    const inactiveToday = await this.prisma.user.findMany({
      where: {
        role: 'customer',
        notificationSettings: {
          promotions: true,
        },
        orders: {
          none: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
      take: 100, // Limit to 100 users per batch
    });

    for (const user of inactiveToday) {
      await this.notificationsService.sendEngagementNotification(user.id, '');
    }
  }

  // Re-engage inactive users
  @Cron('0 9 * * 1') // Every Monday at 9 AM
  async sendInactiveUserNotifications() {
    this.logger.log('Sending inactive user notifications...');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inactiveUsers = await this.prisma.user.findMany({
      where: {
        role: 'customer',
        notificationSettings: {
          promotions: true,
        },
        orders: {
          none: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        },
      },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    for (const user of inactiveUsers) {
      const lastOrder = user.orders[0];
      const daysSinceLastOrder = lastOrder
        ? Math.floor((Date.now() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        : 30;

      await this.notificationsService.sendInactiveUserNotification(
        user.id,
        daysSinceLastOrder,
      );
    }
  }

  // Merchant store opening reminders
  @Cron('0 8 * * *') // 8:00 AM daily
  async sendMerchantOpeningReminders() {
    this.logger.log('Sending merchant opening reminders...');
    
    const merchants = await this.prisma.user.findMany({
      where: {
        role: 'restaurant_owner',
        businessProfile: {
          status: 'inactive', // Store is closed
        },
      },
      include: {
        businessProfile: true,
      },
    });

    for (const merchant of merchants) {
      if (merchant.businessProfile) {
        await this.notificationsService.sendMerchantStoreReminderNotification(
          merchant.id,
          merchant.businessProfile.businessName,
        );
      }
    }
  }

  // Merchant closing reminders
  @Cron('0 21 * * *') // 9:00 PM daily
  async sendMerchantClosingReminders() {
    this.logger.log('Sending merchant closing reminders...');
    
    const merchants = await this.prisma.user.findMany({
      where: {
        role: 'restaurant_owner',
        businessProfile: {
          status: 'active', // Store is still open
        },
      },
      include: {
        businessProfile: true,
      },
    });

    for (const merchant of merchants) {
      if (merchant.businessProfile) {
        await this.notificationsService.sendMerchantClosingReminderNotification(
          merchant.id,
          merchant.businessProfile.businessName,
        );
      }
    }
  }

  // Merchant daily summary
  @Cron('0 22 * * *') // 10:00 PM daily
  async sendMerchantDailySummaries() {
    this.logger.log('Sending merchant daily summaries...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const merchants = await this.prisma.user.findMany({
      where: {
        role: 'restaurant_owner',
      },
      include: {
        businessProfile: {
          include: {
            orders: {
              where: {
                createdAt: { gte: today },
                status: { in: ['delivered', 'completed'] },
              },
            },
          },
        },
      },
    });

    for (const merchant of merchants) {
      if (merchant.businessProfile) {
        const orders = merchant.businessProfile.orders;
        const ordersToday = orders.length;
        const earningsToday = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);

        if (ordersToday > 0) {
          await this.notificationsService.sendMerchantDailySummaryNotification(
            merchant.id,
            ordersToday,
            earningsToday,
          );
        }
      }
    }
  }

  // Driver shift reminders
  @Cron('0 7,11,17 * * *') // 7 AM, 11 AM, 5 PM daily
  async sendDriverShiftReminders() {
    this.logger.log('Sending driver shift reminders...');
    
    const drivers = await this.prisma.user.findMany({
      where: {
        role: 'driver',
        driverProfile: {
          status: 'offline',
        },
      },
    });

    for (const driver of drivers) {
      await this.notificationsService.sendDriverShiftReminderNotification(driver.id);
    }
  }

  // Peak hours notifications for drivers
  @Cron('0 12,18 * * *') // 12 PM and 6 PM daily (peak hours)
  async sendDriverPeakHoursNotifications() {
    this.logger.log('Sending driver peak hours notifications...');
    
    const drivers = await this.prisma.user.findMany({
      where: {
        role: 'driver',
        driverProfile: {
          status: 'available',
        },
      },
    });

    const expectedEarnings = 5000; // ₦5,000 per hour during peak

    for (const driver of drivers) {
      await this.notificationsService.sendDriverPeakHoursNotification(
        driver.id,
        expectedEarnings,
      );
    }
  }

  // Helper method to get active customers
  private async getActiveCustomers() {
    return this.prisma.user.findMany({
      where: {
        role: 'customer',
      },
      include: {
        notificationSettings: true,
      },
      take: 50, // Limit batch size
    });
  }
}
```

**Install scheduling package:**
```bash
npm install @nestjs/schedule
```

**Update notifications.module.ts:**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { FirebaseService } from './firebase.service';
import { ScheduledNotificationsService } from './scheduled-notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import firebaseConfig from '../config/firebase.config';

@Module({
  imports: [
    ConfigModule.forFeature(firebaseConfig),
    ScheduleModule.forRoot(),
    PrismaModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, FirebaseService, ScheduledNotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

#### **Step 9: Integrate with Orders Service**

**File:** `backend/src/orders/orders.service.ts`

```typescript
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    // ... existing dependencies ...
    private notificationsService: NotificationsService,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    // ... existing order creation logic ...

    // Send notification
    await this.notificationsService.sendOrderPlacedNotification(
      userId,
      order.orderNumber,
    );

    return order;
  }

  async acceptOrder(orderId: string, restaurantId: string) {
    // ... existing accept logic ...

    // Send notification
    await this.notificationsService.sendOrderAcceptedNotification(
      order.userId,
      order.orderNumber,
      restaurant.businessName,
    );

    return order;
  }

  // Add similar calls for other order status changes
}
```

---

### **Phase 4: Frontend Implementation** (2-3 hours)

#### **Step 1: Install Dependencies**

```bash
cd frontend
npx expo install expo-notifications expo-device expo-constants
npm install @react-native-firebase/app @react-native-firebase/messaging
```

#### **Step 2: Configure Firebase (Android)**

**File:** `frontend/android/build.gradle`

```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

**File:** `frontend/android/app/build.gradle`

```gradle
apply plugin: 'com.android.application'
// Add this line at the bottom
apply plugin: 'com.google.gms.google-services'
```

#### **Step 3: Configure Firebase (iOS)**

**File:** `frontend/ios/Podfile`

```ruby
# Add Firebase pods
pod 'Firebase/Messaging'
```

Run:
```bash
cd ios
pod install
```

#### **Step 4: Create Notification Service**

**File:** `frontend/src/services/notificationService.ts`

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private notificationListener: any;
  private responseListener: any;

  async registerForPushNotifications() {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      console.log('Push token:', token.data);

      // Register token with backend
      await this.registerTokenWithBackend(token.data);

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  async registerTokenWithBackend(token: string) {
    try {
      await api.post('/notifications/register-token', {
        token,
        platform: Platform.OS,
        deviceId: Constants.deviceId,
      });
      console.log('Token registered with backend');
    } catch (error) {
      console.error('Failed to register token with backend:', error);
    }
  }

  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void,
  ) {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        onNotificationReceived?.(notification);
      },
    );

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        onNotificationTapped?.(response);
      },
    );
  }

  removeNotificationListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  async scheduleLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });
  }
}

export default new NotificationService();
```

#### **Step 5: Integrate with App**

**File:** `frontend/App.tsx` or `frontend/src/App.tsx`

```typescript
import { useEffect } from 'react';
import notificationService from './services/notificationService';
import { useNavigation } from '@react-navigation/native';

function App() {
  const navigation = useNavigation();

  useEffect(() => {
    // Register for push notifications
    notificationService.registerForPushNotifications();

    // Setup listeners
    notificationService.setupNotificationListeners(
      // When notification received while app is open
      (notification) => {
        console.log('Notification received:', notification);
        // Optionally show in-app alert
      },
      // When user taps notification
      (response) => {
        const data = response.notification.request.content.data;
        
        // Navigate based on notification type
        if (data.type === 'order_placed' || data.type === 'order_delivered') {
          navigation.navigate('Orders');
        } else if (data.type === 'promotion') {
          navigation.navigate('Promotions');
        }
      },
    );

    return () => {
      notificationService.removeNotificationListeners();
    };
  }, []);

  return (
    // Your app content
  );
}
```

#### **Step 6: Update AuthContext**

**File:** `frontend/src/contexts/AuthContext.tsx`

```typescript
import notificationService from '../services/notificationService';

const login = async (email: string, password: string) => {
  // ... existing login logic ...
  
  // Register for push notifications after login
  await notificationService.registerForPushNotifications();
};
```

---

### **Phase 5: Testing** (30 minutes)

#### **Test Checklist:**

1. **Backend Test:**
```bash
# Test notification endpoint
POST http://localhost:3000/notifications/register-token
{
  "token": "ExponentPushToken[xxxxxx]",
  "platform": "android"
}
```

2. **Frontend Test:**
- Login to app
- Check console for push token
- Verify token registered in database

3. **End-to-End Test:**
- Place an order
- Check if notification received
- Tap notification
- Verify navigation works

---

## 📊 Notification Types to Implement

### **Customer Notifications:**

#### **Transactional (Order-related):**
- ✅ Order placed confirmation
- ✅ Order accepted by restaurant
- ✅ Driver assigned
- ✅ Order picked up
- ✅ Order out for delivery
- ✅ Order delivered
- ✅ Payment confirmation

#### **Marketing & Engagement:**
- ✅ **"Wake up! Today won't order itself"** - Morning engagement
- ✅ **"Aren't you hungry yet?"** - Meal time reminders
- ✅ **"Time to order something hot!"** - Random engagement
- ✅ **Breakfast reminders** (8:00 AM daily)
- ✅ **Lunch reminders** (12:00 PM daily)
- ✅ **Dinner reminders** (6:00 PM daily)
- ✅ **Inactive user re-engagement** - "We miss you!"
- ✅ **Promotions & special offers**
- ✅ **New restaurants nearby**

### **Restaurant/Merchant Notifications:**

#### **Operational:**
- ✅ New order received
- ✅ Driver assigned to order
- ✅ Order picked up
- ✅ Low inventory alerts

#### **Engagement & Reminders:**
- ✅ **"Don't keep people hungry!"** - Store opening reminder (8:00 AM)
- ✅ **"Time to open your store!"** - Morning reminder
- ✅ **"Customers are waiting!"** - Store status reminder
- ✅ **"Don't forget to open!"** - If store is closed during business hours
- ✅ **Closing time reminder** (9:00 PM)
- ✅ **Pending orders alert** - "You have X orders waiting!"
- ✅ **Daily summary** - Orders and earnings recap (10:00 PM)

### **Driver Notifications:**

#### **Operational:**
- ✅ New delivery request
- ✅ Order ready for pickup
- ✅ Customer location updated
- ✅ Delivery completed confirmation

#### **Engagement:**
- ✅ **"Ready to earn?"** - Shift reminders (7 AM, 11 AM, 5 PM)
- ✅ **"Go online and start earning!"** - When offline
- ✅ **Peak hours alert** - "High demand now! Earn up to ₦5,000/hour"
- ✅ **Daily/weekly earnings summary**

---

## 📅 Scheduled Notification Times

### **Daily Schedule:**

```
🌅 8:00 AM  - Breakfast reminders (customers)
           - Store opening reminders (merchants)

🚗 7:00 AM  - Driver shift reminders
   11:00 AM - Driver shift reminders

😋 10:00 AM - Engagement notifications (customers who haven't ordered)

☀️ 12:00 PM - Lunch reminders (customers)
           - Peak hours alert (drivers)

🍽️ 3:00 PM  - Engagement notifications

🚗 5:00 PM  - Driver shift reminders

🌙 6:00 PM  - Dinner reminders (customers)
           - Peak hours alert (drivers)

📱 8:00 PM  - Engagement notifications

🌃 9:00 PM  - Store closing reminders (merchants)

📊 10:00 PM - Daily summary (merchants)
```

### **Weekly Schedule:**

```
Monday 9:00 AM - Re-engagement for inactive users (7+ days)
```

---

## 🎯 Engagement Notification Examples

### **For Customers:**

**Morning Engagement:**
- 😋 "Hungry Yet? Time to order something hot and delicious!"
- 🍕 "Wake Up! Today won't order itself. Let's get you something tasty!"
- 🔥 "Craving Alert! Aren't you hungry yet? Your favorite meals are waiting!"

**Meal Time:**
- 🌅 "Good Morning! Start your day right with a delicious breakfast!"
- ☀️ "Lunch Time! It's lunch o'clock! Order something hot and tasty!"
- 🌙 "Dinner Time! End your day with a satisfying meal delivered to you!"

**Re-engagement:**
- 😢 "We Miss You! It's been 7 days! Come back for your favorites!"
- 🎁 "Special Offer Inside - We saved something special for you!"
- 👋 "Long Time No See - 10 days without your favorite meal? Let's fix that!"

### **For Merchants:**

**Store Opening:**
- 🏪 "Time to Open! Don't keep people hungry! Your customers are waiting."
- 👨‍🍳 "Ready to Cook? It's time to open your store and serve delicious meals!"
- ⏰ "Store Opening Time - Your hungry customers are looking for you!"
- 🍽️ "People Are Hungry! Don't forget to open your store and start serving!"
- 📱 "Open Your Store - Customers are waiting! Open now and start earning."

**Pending Orders:**
- 🛎️ "Orders Waiting! You have 3 pending orders. Don't keep customers waiting!"

**Daily Summary:**
- 📊 "Daily Summary - Today: 25 orders, ₦125,000 earned. Great job!"

### **For Drivers:**

**Shift Reminders:**
- 🚗 "Ready to Earn? Go online and start accepting deliveries!"

**Peak Hours:**
- 🔥 "Peak Hours Alert! High demand now! Earn up to ₦5,000 per hour!"

---

## 🔒 Security Best Practices

1. **Never expose Firebase Admin SDK credentials in frontend**
2. **Validate user permissions before sending notifications**
3. **Rate limit notification endpoints**
4. **Sanitize notification content**
5. **Implement user notification preferences**
6. **Log all notification sends for audit**

---

## 💰 Cost Estimation

**Firebase Cloud Messaging:**
- ✅ **FREE** for unlimited notifications
- ✅ No monthly fees
- ✅ No per-message charges

**Only costs:**
- Firebase Hosting (if used): $0 (we're not using it)
- Firebase Analytics (optional): FREE

---

## 🚨 Common Issues & Solutions

### **Issue 1: Token not registering**
```typescript
// Solution: Check if device is physical device
if (!Device.isDevice) {
  console.log('Notifications only work on physical devices');
}
```

### **Issue 2: Notifications not showing on Android**
```typescript
// Solution: Create notification channel
await Notifications.setNotificationChannelAsync('default', {
  name: 'default',
  importance: Notifications.AndroidImportance.MAX,
});
```

### **Issue 3: iOS notifications not working**
```bash
# Solution: Enable push notifications capability
# In Xcode: Signing & Capabilities → + Capability → Push Notifications
```

---

## 📚 Next Steps

After basic implementation:

1. **Add notification preferences UI**
2. **Implement notification history**
3. **Add rich notifications (images, actions)**
4. **Implement notification scheduling**
5. **Add analytics tracking**
6. **Implement notification badges**

---

## 🔗 Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [FCM HTTP v1 API](https://firebase.google.com/docs/cloud-messaging/http-server-ref)

---

**Ready to implement? Start with Phase 1!** 🚀
