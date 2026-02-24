# 📝 Notification Template Management System

## Overview

Instead of hardcoding notification messages, this system allows admins to create, edit, and manage notification templates through an admin panel. This gives you full control over all notification messages without touching code.

---

## 🎯 Features

### **Admin Panel Capabilities:**
- ✅ Create custom notification templates
- ✅ Edit existing templates
- ✅ Enable/disable templates
- ✅ Preview templates before saving
- ✅ Use variables/placeholders (e.g., `{userName}`, `{orderNumber}`)
- ✅ Schedule templates for specific times
- ✅ A/B test different messages
- ✅ View template performance (open rates, click rates)

### **Template Types:**
- Customer engagement messages
- Merchant reminders
- Driver alerts
- Order notifications
- Promotional messages

---

## 📊 Database Schema

### **NotificationTemplate Model**

Add to `backend/prisma/schema.prisma`:

```prisma
model NotificationTemplate {
  id          String   @id @default(uuid())
  
  // Template identification
  key         String   @unique // e.g., 'customer_engagement_morning'
  name        String   // e.g., 'Morning Engagement - Hungry Yet?'
  description String?  // Admin notes about this template
  
  // Template content
  title       String   // e.g., '😋 Hungry Yet?'
  body        String   // e.g., 'Time to order something hot and delicious!'
  
  // Template configuration
  type        NotificationType // 'engagement', 'transactional', 'promotional', etc.
  category    String   // 'customer', 'merchant', 'driver'
  
  // Scheduling
  isScheduled Boolean  @default(false)
  scheduleTime String? // Cron expression: '0 8 * * *' for 8 AM daily
  
  // Targeting
  targetRole  String[] // ['customer', 'merchant', 'driver']
  conditions  Json?    // Advanced targeting conditions
  
  // Status
  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false) // System default templates
  
  // A/B Testing
  variant     String?  // 'A', 'B', etc.
  variantGroup String? // Group variants together
  
  // Analytics
  sentCount   Int      @default(0)
  openCount   Int      @default(0)
  clickCount  Int      @default(0)
  
  // Metadata
  createdBy   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastUsedAt  DateTime?
  
  // Relations
  creator     User?    @relation(fields: [createdBy], references: [id])
  
  @@index([key])
  @@index([type])
  @@index([category])
  @@index([isActive])
}

enum NotificationType {
  transactional    // Order updates, payment confirmations
  engagement       // "Aren't you hungry yet?"
  promotional      // Discounts, special offers
  reminder         // Store opening, shift reminders
  alert            // Urgent notifications
  informational    // News, updates
}
```

### **NotificationLog Model** (for analytics)

```prisma
model NotificationLog {
  id              String   @id @default(uuid())
  
  templateId      String
  userId          String
  
  // Content sent
  title           String
  body            String
  data            Json?
  
  // Delivery
  status          String   // 'sent', 'delivered', 'failed', 'opened', 'clicked'
  platform        String   // 'ios', 'android', 'web'
  
  // Analytics
  sentAt          DateTime @default(now())
  deliveredAt     DateTime?
  openedAt        DateTime?
  clickedAt       DateTime?
  
  // Error tracking
  errorMessage    String?
  
  @@index([templateId])
  @@index([userId])
  @@index([status])
  @@index([sentAt])
}
```

---

## 🔧 Backend Implementation

### **Step 1: Create Template Service**

**File:** `backend/src/notifications/notification-template.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

export interface CreateTemplateDto {
  key: string;
  name: string;
  description?: string;
  title: string;
  body: string;
  type: NotificationType;
  category: string;
  targetRole: string[];
  isScheduled?: boolean;
  scheduleTime?: string;
  isActive?: boolean;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}

@Injectable()
export class NotificationTemplateService {
  constructor(private prisma: PrismaService) {}

  // Create new template
  async createTemplate(dto: CreateTemplateDto, createdBy: string) {
    return this.prisma.notificationTemplate.create({
      data: {
        ...dto,
        createdBy,
      },
    });
  }

  // Get all templates
  async getAllTemplates(filters?: {
    type?: NotificationType;
    category?: string;
    isActive?: boolean;
  }) {
    return this.prisma.notificationTemplate.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // Get template by key
  async getTemplateByKey(key: string) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { key },
    });

    if (!template) {
      throw new NotFoundException(`Template with key '${key}' not found`);
    }

    return template;
  }

  // Get active template by key (with fallback to default)
  async getActiveTemplate(key: string) {
    // Try to get active custom template
    let template = await this.prisma.notificationTemplate.findFirst({
      where: {
        key,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fallback to default template
    if (!template) {
      template = await this.prisma.notificationTemplate.findFirst({
        where: {
          key,
          isDefault: true,
        },
      });
    }

    return template;
  }

  // Update template
  async updateTemplate(id: string, dto: UpdateTemplateDto) {
    return this.prisma.notificationTemplate.update({
      where: { id },
      data: dto,
    });
  }

  // Delete template
  async deleteTemplate(id: string) {
    return this.prisma.notificationTemplate.delete({
      where: { id },
    });
  }

  // Toggle template active status
  async toggleActive(id: string) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id },
    });

    return this.prisma.notificationTemplate.update({
      where: { id },
      data: { isActive: !template.isActive },
    });
  }

  // Get templates for scheduling
  async getScheduledTemplates() {
    return this.prisma.notificationTemplate.findMany({
      where: {
        isScheduled: true,
        isActive: true,
      },
    });
  }

  // Replace placeholders in template
  replacePlaceholders(
    template: string,
    variables: Record<string, string | number>,
  ): string {
    let result = template;
    
    Object.keys(variables).forEach((key) => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(variables[key]));
    });
    
    return result;
  }

  // Get random template from variant group
  async getRandomVariant(variantGroup: string) {
    const variants = await this.prisma.notificationTemplate.findMany({
      where: {
        variantGroup,
        isActive: true,
      },
    });

    if (variants.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * variants.length);
    return variants[randomIndex];
  }

  // Update analytics
  async incrementSentCount(templateId: string) {
    return this.prisma.notificationTemplate.update({
      where: { id: templateId },
      data: {
        sentCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }

  async incrementOpenCount(templateId: string) {
    return this.prisma.notificationTemplate.update({
      where: { id: templateId },
      data: { openCount: { increment: 1 } },
    });
  }

  async incrementClickCount(templateId: string) {
    return this.prisma.notificationTemplate.update({
      where: { id: templateId },
      data: { clickCount: { increment: 1 } },
    });
  }

  // Get template analytics
  async getTemplateAnalytics(templateId: string) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const openRate = template.sentCount > 0
      ? (template.openCount / template.sentCount) * 100
      : 0;

    const clickRate = template.sentCount > 0
      ? (template.clickCount / template.sentCount) * 100
      : 0;

    return {
      ...template,
      openRate: openRate.toFixed(2),
      clickRate: clickRate.toFixed(2),
    };
  }
}
```

### **Step 2: Update Notifications Service**

**File:** `backend/src/notifications/notifications.service.ts`

Add template support:

```typescript
import { NotificationTemplateService } from './notification-template.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
    private templateService: NotificationTemplateService, // Add this
  ) {}

  // Updated method to use templates
  async sendEngagementNotification(userId: string, templateKey?: string) {
    // Get template from database
    const template = templateKey
      ? await this.templateService.getActiveTemplate(templateKey)
      : await this.templateService.getRandomVariant('customer_engagement');

    if (!template) {
      // Fallback to hardcoded if no template found
      return this.sendEngagementNotificationFallback(userId);
    }

    // Get user data for personalization
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Replace placeholders
    const title = this.templateService.replacePlaceholders(template.title, {
      userName: user.firstName || 'there',
    });

    const body = this.templateService.replacePlaceholders(template.body, {
      userName: user.firstName || 'there',
    });

    // Send notification
    const result = await this.sendToUser({
      userId,
      title,
      body,
      data: {
        type: 'engagement',
        templateId: template.id,
      },
    });

    // Update analytics
    if (result.success) {
      await this.templateService.incrementSentCount(template.id);
    }

    return result;
  }

  // Similar updates for other notification methods
  async sendMerchantStoreReminderNotification(userId: string, restaurantName: string) {
    const template = await this.templateService.getRandomVariant('merchant_opening_reminder');

    if (template) {
      const title = this.templateService.replacePlaceholders(template.title, {
        restaurantName,
      });

      const body = this.templateService.replacePlaceholders(template.body, {
        restaurantName,
      });

      const result = await this.sendToUser({
        userId,
        title,
        body,
        data: {
          type: 'merchant_reminder',
          action: 'open_store',
          templateId: template.id,
        },
      });

      if (result.success) {
        await this.templateService.incrementSentCount(template.id);
      }

      return result;
    }

    // Fallback to hardcoded
    return this.sendMerchantStoreReminderNotificationFallback(userId, restaurantName);
  }
}
```

### **Step 3: Create Template Controller**

**File:** `backend/src/notifications/notification-template.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationTemplateService } from './notification-template.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin/notification-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class NotificationTemplateController {
  constructor(private templateService: NotificationTemplateService) {}

  @Post()
  async createTemplate(@Body() dto: any, @CurrentUser() user: any) {
    return this.templateService.createTemplate(dto, user.id);
  }

  @Get()
  async getAllTemplates(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.templateService.getAllTemplates({
      type: type as any,
      category,
      isActive: isActive === 'true',
    });
  }

  @Get(':id')
  async getTemplate(@Param('id') id: string) {
    return this.templateService.getTemplateByKey(id);
  }

  @Get(':id/analytics')
  async getTemplateAnalytics(@Param('id') id: string) {
    return this.templateService.getTemplateAnalytics(id);
  }

  @Put(':id')
  async updateTemplate(@Param('id') id: string, @Body() dto: any) {
    return this.templateService.updateTemplate(id, dto);
  }

  @Put(':id/toggle')
  async toggleActive(@Param('id') id: string) {
    return this.templateService.toggleActive(id);
  }

  @Delete(':id')
  async deleteTemplate(@Param('id') id: string) {
    return this.templateService.deleteTemplate(id);
  }
}
```

---

## 🌱 Seed Default Templates

**File:** `backend/prisma/seed-templates.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNotificationTemplates() {
  console.log('🔔 Seeding notification templates...');

  const templates = [
    // Customer Engagement - Morning
    {
      key: 'customer_engagement_morning_1',
      name: 'Morning Engagement - Wake Up',
      title: '🍕 Wake Up!',
      body: "Today won't order itself. Let's get you something tasty!",
      type: 'engagement',
      category: 'customer',
      targetRole: ['customer'],
      variantGroup: 'customer_engagement',
      isDefault: true,
    },
    {
      key: 'customer_engagement_morning_2',
      name: 'Morning Engagement - Hungry Yet',
      title: '😋 Hungry Yet?',
      body: 'Time to order something hot and delicious!',
      type: 'engagement',
      category: 'customer',
      targetRole: ['customer'],
      variantGroup: 'customer_engagement',
      variant: 'A',
    },
    {
      key: 'customer_engagement_morning_3',
      name: 'Morning Engagement - Craving Alert',
      title: '🔥 Craving Alert!',
      body: "Aren't you hungry yet? Your favorite meals are waiting!",
      type: 'engagement',
      category: 'customer',
      targetRole: ['customer'],
      variantGroup: 'customer_engagement',
      variant: 'B',
    },

    // Meal Time Reminders
    {
      key: 'meal_reminder_breakfast',
      name: 'Breakfast Reminder',
      title: '🌅 Good Morning, {userName}!',
      body: 'Start your day right with a delicious breakfast!',
      type: 'reminder',
      category: 'customer',
      targetRole: ['customer'],
      isScheduled: true,
      scheduleTime: '0 8 * * *', // 8 AM daily
      isDefault: true,
    },
    {
      key: 'meal_reminder_lunch',
      name: 'Lunch Reminder',
      title: '☀️ Lunch Time!',
      body: "It's lunch o'clock! Order something hot and tasty!",
      type: 'reminder',
      category: 'customer',
      targetRole: ['customer'],
      isScheduled: true,
      scheduleTime: '0 12 * * *', // 12 PM daily
      isDefault: true,
    },
    {
      key: 'meal_reminder_dinner',
      name: 'Dinner Reminder',
      title: '🌙 Dinner Time!',
      body: 'End your day with a satisfying meal delivered to you!',
      type: 'reminder',
      category: 'customer',
      targetRole: ['customer'],
      isScheduled: true,
      scheduleTime: '0 18 * * *', // 6 PM daily
      isDefault: true,
    },

    // Merchant Reminders
    {
      key: 'merchant_opening_reminder_1',
      name: 'Store Opening - Dont Keep Hungry',
      title: '🏪 Time to Open!',
      body: "Don't keep people hungry! Your customers are waiting.",
      type: 'reminder',
      category: 'merchant',
      targetRole: ['restaurant_owner'],
      variantGroup: 'merchant_opening_reminder',
      isDefault: true,
    },
    {
      key: 'merchant_opening_reminder_2',
      name: 'Store Opening - Ready to Cook',
      title: '👨‍🍳 Ready to Cook?',
      body: "It's time to open your store and serve delicious meals!",
      type: 'reminder',
      category: 'merchant',
      targetRole: ['restaurant_owner'],
      variantGroup: 'merchant_opening_reminder',
      variant: 'A',
    },
    {
      key: 'merchant_opening_reminder_3',
      name: 'Store Opening - People Hungry',
      title: '🍽️ People Are Hungry!',
      body: "Don't forget to open your store and start serving!",
      type: 'reminder',
      category: 'merchant',
      targetRole: ['restaurant_owner'],
      variantGroup: 'merchant_opening_reminder',
      variant: 'B',
    },

    // Driver Reminders
    {
      key: 'driver_shift_reminder',
      name: 'Driver Shift Reminder',
      title: '🚗 Ready to Earn?',
      body: 'Go online and start accepting deliveries!',
      type: 'reminder',
      category: 'driver',
      targetRole: ['driver'],
      isDefault: true,
    },
    {
      key: 'driver_peak_hours',
      name: 'Driver Peak Hours Alert',
      title: '🔥 Peak Hours Alert!',
      body: 'High demand now! Earn up to ₦{expectedEarnings} per hour!',
      type: 'alert',
      category: 'driver',
      targetRole: ['driver'],
      isDefault: true,
    },
  ];

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { key: template.key },
      update: template,
      create: template as any,
    });
  }

  console.log(`✅ Created ${templates.length} notification templates\n`);
}

seedNotificationTemplates()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run with:
```bash
npx ts-node prisma/seed-templates.ts
```

---

## 🎨 Frontend Admin Panel

### **Template Management Screen**

**Features:**
- List all templates
- Create new template
- Edit existing template
- Toggle active/inactive
- Preview template
- View analytics (sent, opened, clicked)
- A/B test management

**UI Components Needed:**
1. `TemplateListScreen` - View all templates
2. `TemplateEditorModal` - Create/edit template
3. `TemplatePreviewModal` - Preview before saving
4. `TemplateAnalyticsCard` - Show performance metrics

---

## 📊 Available Placeholders

Templates can use these placeholders:

### **User Placeholders:**
- `{userName}` - User's first name
- `{userEmail}` - User's email
- `{userPhone}` - User's phone number

### **Order Placeholders:**
- `{orderNumber}` - Order number (e.g., FUL-2026-001)
- `{orderAmount}` - Order total amount
- `{restaurantName}` - Restaurant name
- `{driverName}` - Driver name
- `{estimatedTime}` - Estimated delivery time

### **Business Placeholders:**
- `{restaurantName}` - Restaurant/business name
- `{ordersToday}` - Number of orders today
- `{earningsToday}` - Earnings today
- `{pendingOrdersCount}` - Pending orders count

### **Driver Placeholders:**
- `{expectedEarnings}` - Expected earnings
- `{deliveriesCompleted}` - Deliveries completed
- `{currentRating}` - Current rating

---

## 🎯 Example Admin Workflow

### **1. Create New Engagement Template:**

```json
{
  "key": "customer_engagement_custom_1",
  "name": "Custom Hungry Message",
  "title": "🍔 Hey {userName}!",
  "body": "It's been a while! Your favorite restaurant misses you!",
  "type": "engagement",
  "category": "customer",
  "targetRole": ["customer"],
  "variantGroup": "customer_engagement",
  "variant": "C",
  "isActive": true
}
```

### **2. A/B Test Two Messages:**

**Variant A:**
```
Title: "😋 Hungry Yet?"
Body: "Time to order something hot!"
```

**Variant B:**
```
Title: "🔥 Craving Alert!"
Body: "Your favorite meals are waiting!"
```

System randomly picks one and tracks which performs better.

### **3. View Analytics:**

```
Template: "Wake Up! Today won't order itself"
Sent: 1,250
Opened: 425 (34%)
Clicked: 187 (15%)
Status: Active ✅
```

---

## 🚀 Benefits

### **For You:**
- ✅ Change messages anytime without code deployment
- ✅ Test different messages to see what works
- ✅ Personalize with user data
- ✅ Schedule messages for specific times
- ✅ Track performance of each message

### **For Marketing Team:**
- ✅ Full control over messaging
- ✅ A/B test campaigns
- ✅ See what resonates with users
- ✅ Quick iterations

### **For Users:**
- ✅ More relevant, personalized messages
- ✅ Better engagement
- ✅ Less spam (you can disable poor performers)

---

## 📝 API Endpoints

```
POST   /admin/notification-templates          - Create template
GET    /admin/notification-templates          - List all templates
GET    /admin/notification-templates/:id      - Get template
PUT    /admin/notification-templates/:id      - Update template
DELETE /admin/notification-templates/:id      - Delete template
PUT    /admin/notification-templates/:id/toggle - Toggle active
GET    /admin/notification-templates/:id/analytics - Get analytics
```

---

## ✅ Migration Path

### **Phase 1: Add Database Schema**
```bash
npx prisma migrate dev --name add_notification_templates
```

### **Phase 2: Seed Default Templates**
```bash
npx ts-node prisma/seed-templates.ts
```

### **Phase 3: Update Notification Service**
- Modify to check database first
- Fallback to hardcoded if template not found

### **Phase 4: Build Admin UI**
- Template management screen
- Analytics dashboard

---

**Now you can change "Aren't you hungry yet?" to "Feeling peckish?" without touching code!** 🎉
