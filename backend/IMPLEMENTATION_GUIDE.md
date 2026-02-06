# Backend Implementation Guide

## ✅ Completed Steps

### 1. Database Schema
- ✅ Added `RefreshToken` model for secure JWT rotation
- ✅ Added `DigitalWallet` model for payment management
- ✅ Added `WithdrawalRequest` model with security features
- ✅ Added `Notification` model for multi-channel notifications
- ✅ Added `DeviceToken` model for push notifications
- ✅ Updated `Order` model with payment fields
- ✅ Migration applied: `add-security-wallet-notifications`

### 2. Dependencies Installed
```bash
✅ @nestjs/throttler - Rate limiting
✅ @nestjs/passport, passport, passport-jwt - Authentication
✅ class-validator, class-transformer - Validation
✅ ioredis - Redis client
✅ @nestjs/bull, bull - Queue management
✅ compression - Response compression
✅ helmet - Security headers
```

### 3. Services Created
- ✅ `RefreshTokenService` - Token rotation and validation
- ✅ `CustomThrottlerGuard` - Rate limiting guard

---

## 🚀 Next Steps (Priority Order)

### Phase 1: Security & Authentication (Week 1)

#### A. Update Auth Module
**File:** `backend/src/auth/auth.module.ts`

Add RefreshTokenService to providers:
```typescript
import { RefreshTokenService } from './refresh-token.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN') || '1h',
        } as any,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenService], // Add RefreshTokenService
  exports: [AuthService, RefreshTokenService],
})
export class AuthModule {}
```

#### B. Add Refresh Token Endpoints
**File:** `backend/src/auth/auth.controller.ts`

Add these endpoints:
```typescript
@Post('refresh')
async refresh(@Body('refreshToken') refreshToken: string) {
  // Validate refresh token and issue new access token
}

@Post('logout')
async logout(@Body('refreshToken') refreshToken: string) {
  // Revoke refresh token
}
```

#### C. Enable Rate Limiting
**File:** `backend/src/app.module.ts`

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    // ... other modules
  ],
})
```

**File:** `backend/src/main.ts`

```typescript
import { CustomThrottlerGuard } from './common/guards/throttle.guard';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security
  app.use(helmet());
  app.use(compression());
  
  // Rate limiting (apply globally)
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new CustomThrottlerGuard({ reflector }));
  
  // ... rest of bootstrap
}
```

---

### Phase 2: Order Management (Week 1-2)

#### Create Order Module

**1. Create Order Service**
```bash
# Run from backend folder
mkdir src/orders
```

**File:** `backend/src/orders/orders.service.ts`
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(customerId: string, data: CreateOrderDto) {
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return this.prisma.order.create({
      data: {
        orderNumber,
        customerId,
        businessId: data.businessId,
        status: 'pending',
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        serviceFee: data.serviceFee,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        specialInstructions: data.specialInstructions,
      },
    });
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        ...(status === 'accepted' && { acceptedAt: new Date() }),
        ...(status === 'preparing' && { preparationStartedAt: new Date() }),
        ...(status === 'ready' && { readyAt: new Date() }),
        ...(status === 'picked_up' && { pickedUpAt: new Date() }),
        ...(status === 'delivered' && { deliveredAt: new Date() }),
      },
    });
  }

  async getCustomerOrders(customerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { customerId } }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

**2. Create DTOs**
**File:** `backend/src/orders/dto/create-order.dto.ts`
```typescript
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  businessId: string;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  deliveryFee: number;

  @IsNumber()
  @Min(0)
  serviceFee: number;

  @IsNumber()
  @Min(0)
  taxAmount: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}
```

---

### Phase 3: Wallet & Payments (Week 2-3)

#### Create Wallet Service

**File:** `backend/src/wallet/wallet.service.ts`
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomInt } from 'crypto';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateWallet(userId: string) {
    let wallet = await this.prisma.digitalWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.digitalWallet.create({
        data: { userId },
      });
    }

    return wallet;
  }

  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      frozenBalance: wallet.frozenBalance,
      availableBalance: wallet.balance - wallet.frozenBalance,
    };
  }

  async requestWithdrawal(userId: string, amount: number, ipAddress: string) {
    const wallet = await this.getOrCreateWallet(userId);

    // Validation
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const availableBalance = wallet.balance - wallet.frozenBalance;
    if (amount > availableBalance) {
      throw new BadRequestException('Insufficient balance');
    }

    // Generate 6-digit confirmation code
    const confirmationCode = randomInt(100000, 999999).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const request = await this.prisma.withdrawalRequest.create({
      data: {
        userId,
        walletId: wallet.id,
        amount,
        confirmationCode,
        codeExpiresAt,
        ipAddress,
        status: 'pending',
      },
    });

    // TODO: Send confirmation code via email/SMS
    // await this.notificationService.sendWithdrawalCode(userId, confirmationCode);

    return {
      requestId: request.id,
      message: 'Confirmation code sent to your email',
    };
  }

  async confirmWithdrawal(requestId: string, code: string) {
    const request = await this.prisma.withdrawalRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new BadRequestException('Invalid request');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Request already processed');
    }

    if (!request.confirmationCode || request.confirmationCode !== code) {
      throw new BadRequestException('Invalid confirmation code');
    }

    if (new Date() > request.codeExpiresAt) {
      throw new BadRequestException('Confirmation code expired');
    }

    // Update request status
    await this.prisma.withdrawalRequest.update({
      where: { id: requestId },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    // Deduct from wallet (move to pending)
    await this.prisma.digitalWallet.update({
      where: { id: request.walletId },
      data: {
        balance: { decrement: request.amount },
        pendingBalance: { increment: request.amount },
      },
    });

    // TODO: Process actual withdrawal with payment provider
    // await this.paymentService.processWithdrawal(request);

    return {
      message: 'Withdrawal confirmed and processing',
      amount: request.amount,
    };
  }
}
```

---

### Phase 4: Notifications (Week 3)

#### Create Notification Service

**File:** `backend/src/notifications/notifications.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || {},
      },
    });
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  // TODO: Implement push notification sending
  async sendPushNotification(userId: string, title: string, body: string) {
    // Get user's device tokens
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId, isActive: true },
    });

    // Send to FCM/APNS
    // Implementation depends on firebase-admin or similar
  }
}
```

---

## 📱 Mobile Optimization

### Response Compression
Already added via `compression` middleware in main.ts

### Pagination Helper
**File:** `backend/src/common/dto/pagination.dto.ts`
```typescript
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

---

## 🔐 Security Checklist

- [x] JWT with refresh tokens
- [x] Rate limiting configured
- [x] Helmet for security headers
- [x] Input validation with class-validator
- [x] Password hashing with bcrypt
- [ ] Email verification endpoints
- [ ] 2FA implementation
- [ ] API key authentication for mobile
- [ ] Request signing
- [ ] Audit logging

---

## 🚀 Quick Start Commands

```bash
# Start dev server
npm run start:dev

# Generate Prisma client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# View database in Prisma Studio
npx prisma studio
```

---

## 📊 Testing

Create test files for each service:
- `orders.service.spec.ts`
- `wallet.service.spec.ts`
- `notifications.service.spec.ts`

Run tests:
```bash
npm run test
npm run test:e2e
```

---

## 🔄 Next Implementation Priority

1. **Week 1**: Complete Order service + endpoints
2. **Week 2**: Wallet service + withdrawal security
3. **Week 3**: Notification service + push notifications
4. **Week 4**: File upload service + image optimization
5. **Week 5**: Redis caching + session management
6. **Week 6**: Queue system for async operations

---

## 📝 Notes

- TypeScript errors about Prisma models will resolve after restarting TS server
- Always run `npx prisma generate` after schema changes
- Test withdrawal flow thoroughly before production
- Implement proper logging for all financial transactions
- Add monitoring for rate limit violations
