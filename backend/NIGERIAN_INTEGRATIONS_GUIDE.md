# Nigerian Market Integrations - Complete Implementation Guide

## 🇳🇬 Critical Features for Nigerian Delivery Platform

This guide covers all **REQUIRED** integrations for the Nigerian market:

1. ✅ **Location Tracking** - GPS for drivers (IMPLEMENTED)
2. **Paystack Integration** - Nigerian payment gateway
3. **Analytics Service** - Business metrics and reporting
4. **Admin Dashboard** - Complete admin endpoints
5. **Termii Integration** - SMS/Email for Nigeria
6. **Firebase Push Notifications** - Mobile notifications

---

## ✅ Step 7: Location Tracking (GPS) - COMPLETED

### What's Implemented

**LocationService Features:**
- Real-time driver location updates
- Location history tracking
- Find nearby drivers (Haversine formula)
- Track order delivery in real-time
- Driver online/offline status
- Automatic cleanup of old location data

### API Endpoints (7)

```
POST   /location/driver/update          - Update driver location
GET    /location/driver/current         - Get current driver location
GET    /location/driver/:driverId       - Get specific driver location
GET    /location/driver/:driverId/history - Get location history
POST   /location/driver/online          - Set driver online/offline
GET    /location/nearby                 - Find nearby drivers
GET    /location/track/order/:orderId   - Track order delivery
```

### Testing Location Tracking

#### 1. Driver Updates Location (Every 10-30 seconds)
```bash
POST http://localhost:3001/location/driver/update
Authorization: Bearer <driver-token>
Content-Type: application/json

{
  "latitude": 6.5244,
  "longitude": 3.3792,
  "accuracy": 10.5,
  "heading": 45.0,
  "speed": 25.5
}
```

#### 2. Find Nearby Drivers (Lagos coordinates)
```bash
GET http://localhost:3001/location/nearby?latitude=6.5244&longitude=3.3792&radius=5
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "driver": {
      "id": "driver-uuid",
      "name": "John Doe",
      "phone": "+2348012345678",
      "rating": 4.8,
      "vehicleType": "motorcycle"
    },
    "location": {
      "latitude": 6.5250,
      "longitude": 3.3800,
      "accuracy": 10.5,
      "timestamp": "2026-02-06T20:00:00.000Z"
    },
    "distance": 0.85
  }
]
```

#### 3. Track Order Delivery
```bash
GET http://localhost:3001/location/track/order/<order-id>
Authorization: Bearer <token>
```

### Mobile Integration (React Native)

```javascript
// Start location tracking for driver
import Geolocation from '@react-native-community/geolocation';

const startLocationTracking = (token) => {
  const watchId = Geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      
      await fetch('http://your-api.com/location/driver/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          accuracy,
          heading,
          speed,
        }),
      });
    },
    (error) => console.error(error),
    {
      enableHighAccuracy: true,
      distanceFilter: 10, // Update every 10 meters
      interval: 10000, // Update every 10 seconds
      fastestInterval: 5000,
    }
  );

  return watchId;
};
```

---

## 💳 Step 8: Paystack Integration (Nigerian Payment Gateway)

### Installation

```bash
npm install paystack-api axios
```

### Environment Variables

Add to `.env`:
```
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_CALLBACK_URL=https://your-domain.com/api/payment/callback
```

### Implementation

**File:** `backend/src/payment/payment.service.ts`

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private paystackSecretKey: string;
  private paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.paystackSecretKey = this.config.get('PAYSTACK_SECRET_KEY');
  }

  async initializePayment(userId: string, orderId: string, amount: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.customerId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    // Initialize Paystack payment
    const response = await axios.post(
      `${this.paystackBaseUrl}/transaction/initialize`,
      {
        email: order.customer.email,
        amount: Math.round(amount * 100), // Convert to kobo
        currency: 'NGN',
        reference: `ORD-${order.orderNumber}-${Date.now()}`,
        callback_url: this.config.get('PAYSTACK_CALLBACK_URL'),
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // Update order with payment reference
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: response.data.data.reference,
        paymentStatus: 'pending',
      },
    });

    return {
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
    };
  }

  async verifyPayment(reference: string) {
    const response = await axios.get(
      `${this.paystackBaseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      },
    );

    const { data } = response.data;

    if (data.status === 'success') {
      // Update order payment status
      const orderId = data.metadata.orderId;
      
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          paymentMethod: data.channel,
        },
      });

      // Credit driver/business wallet if applicable
      // ... wallet logic here

      return {
        success: true,
        amount: data.amount / 100, // Convert from kobo
        reference: data.reference,
        paidAt: data.paid_at,
      };
    }

    return { success: false };
  }

  async processRefund(orderId: string, amount?: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.paymentId) {
      throw new BadRequestException('Invalid order or payment');
    }

    const refundAmount = amount || Number(order.totalAmount);

    const response = await axios.post(
      `${this.paystackBaseUrl}/refund`,
      {
        transaction: order.paymentId,
        amount: Math.round(refundAmount * 100), // Convert to kobo
      },
      {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: amount ? 'partially_refunded' : 'refunded',
        status: 'refunded',
      },
    });

    return response.data;
  }

  async getPaymentHistory(userId: string) {
    return this.prisma.order.findMany({
      where: {
        customerId: userId,
        paymentStatus: { in: ['paid', 'refunded', 'partially_refunded'] },
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        paymentStatus: true,
        paymentMethod: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

### Paystack Endpoints

```typescript
// payment.controller.ts
@Post('initialize')
async initializePayment(
  @Request() req: any,
  @Body() body: { orderId: string; amount: number },
) {
  return this.paymentService.initializePayment(req.user.sub, body.orderId, body.amount);
}

@Get('verify/:reference')
async verifyPayment(@Param('reference') reference: string) {
  return this.paymentService.verifyPayment(reference);
}

@Post('refund/:orderId')
async refundPayment(
  @Param('orderId') orderId: string,
  @Body('amount') amount?: number,
) {
  return this.paymentService.processRefund(orderId, amount);
}
```

### Mobile Integration (React Native)

```javascript
import { Paystack } from 'react-native-paystack-webview';

const PaymentScreen = ({ orderId, amount, email }) => {
  const [paystackKey, setPaystackKey] = useState('pk_test_xxx');

  return (
    <Paystack
      paystackKey={paystackKey}
      amount={amount}
      billingEmail={email}
      activityIndicatorColor="green"
      onCancel={() => {
        // Handle cancellation
      }}
      onSuccess={(res) => {
        // Verify payment on backend
        fetch(`/api/payment/verify/${res.reference}`)
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              // Payment successful
            }
          });
      }}
      autoStart={true}
    />
  );
};
```

---

## 📊 Step 9: Analytics Service

### Implementation

**File:** `backend/src/analytics/analytics.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string, userRole: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (userRole === 'business_owner') {
      return this.getBusinessStats(userId, today);
    } else if (userRole === 'driver') {
      return this.getDriverStats(userId, today);
    } else if (userRole === 'admin') {
      return this.getAdminStats(today);
    }

    return this.getCustomerStats(userId, today);
  }

  private async getBusinessStats(businessId: string, today: Date) {
    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      pendingOrders,
      avgRating,
    ] = await Promise.all([
      this.prisma.order.count({ where: { businessId } }),
      this.prisma.order.count({
        where: { businessId, createdAt: { gte: today } },
      }),
      this.prisma.order.aggregate({
        where: { businessId, paymentStatus: 'paid' },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: {
          businessId,
          paymentStatus: 'paid',
          createdAt: { gte: today },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.count({
        where: { businessId, status: { in: ['pending', 'accepted'] } },
      }),
      this.prisma.businessProfile.findUnique({
        where: { userId: businessId },
        select: { rating: true },
      }),
    ]);

    return {
      totalOrders,
      todayOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      todayRevenue: Number(todayRevenue._sum.totalAmount || 0),
      pendingOrders,
      rating: Number(avgRating?.rating || 0),
    };
  }

  private async getDriverStats(driverId: string, today: Date) {
    const [
      totalDeliveries,
      todayDeliveries,
      totalEarnings,
      todayEarnings,
      activeOrders,
      rating,
    ] = await Promise.all([
      this.prisma.order.count({ where: { driverId } }),
      this.prisma.order.count({
        where: { driverId, createdAt: { gte: today } },
      }),
      this.prisma.order.aggregate({
        where: { driverId, status: 'delivered' },
        _sum: { deliveryFee: true },
      }),
      this.prisma.order.aggregate({
        where: {
          driverId,
          status: 'delivered',
          createdAt: { gte: today },
        },
        _sum: { deliveryFee: true },
      }),
      this.prisma.order.count({
        where: { driverId, status: { in: ['picked_up', 'in_transit'] } },
      }),
      this.prisma.driverProfile.findUnique({
        where: { userId: driverId },
        select: { rating: true },
      }),
    ]);

    return {
      totalDeliveries,
      todayDeliveries,
      totalEarnings: Number(totalEarnings._sum.deliveryFee || 0),
      todayEarnings: Number(todayEarnings._sum.deliveryFee || 0),
      activeOrders,
      rating: Number(rating?.rating || 0),
    };
  }

  private async getAdminStats(today: Date) {
    const [
      totalUsers,
      totalOrders,
      todayOrders,
      totalRevenue,
      activeDrivers,
      activeBusinesses,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { totalAmount: true },
      }),
      this.prisma.driverProfile.count({ where: { onlineStatus: true } }),
      this.prisma.businessProfile.count(),
    ]);

    return {
      totalUsers,
      totalOrders,
      todayOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      activeDrivers,
      activeBusinesses,
    };
  }

  async getRevenueChart(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        businessId: userId,
        paymentStatus: 'paid',
        createdAt: { gte: startDate },
      },
      _sum: { totalAmount: true },
    });

    return orders.map((order) => ({
      date: order.createdAt,
      revenue: Number(order._sum.totalAmount || 0),
    }));
  }
}
```

---

## 👨‍💼 Step 10: Admin Dashboard Endpoints

### Admin Service

**File:** `backend/src/admin/admin.service.ts`

```typescript
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private verifyAdmin(userRole: string) {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  async getAllUsers(userRole: string, page = 1, limit = 50) {
    this.verifyAdmin(userRole);

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return { data: users, meta: { page, limit, total } };
  }

  async suspendUser(userRole: string, userId: string) {
    this.verifyAdmin(userRole);

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'suspended' },
    });
  }

  async getAllOrders(userRole: string, page = 1, limit = 50) {
    this.verifyAdmin(userRole);

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        include: {
          customer: { select: { firstName: true, lastName: true } },
          driver: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count(),
    ]);

    return { data: orders, meta: { page, limit, total } };
  }

  async getPlatformMetrics(userRole: string) {
    this.verifyAdmin(userRole);

    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      activeDrivers,
      pendingWithdrawals,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { totalAmount: true },
      }),
      this.prisma.driverProfile.count({ where: { onlineStatus: true } }),
      this.prisma.withdrawalRequest.count({ where: { status: 'pending' } }),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      activeDrivers,
      pendingWithdrawals,
    };
  }
}
```

---

## 📧 Step 11: Termii Integration (Nigerian SMS/Email)

### Installation

```bash
npm install axios
```

### Environment Variables

```
TERMII_API_KEY=your_termii_api_key
TERMII_SENDER_ID=YourBrand
```

### Implementation

**File:** `backend/src/messaging/termii.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TermiiService {
  private apiKey: string;
  private senderId: string;
  private baseUrl = 'https://api.ng.termii.com/api';

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('TERMII_API_KEY');
    this.senderId = this.config.get('TERMII_SENDER_ID');
  }

  async sendSMS(to: string, message: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/sms/send`, {
        to,
        from: this.senderId,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: this.apiKey,
      });

      console.log(`[TERMII SMS] Sent to ${to}: ${message}`);
      return response.data;
    } catch (error) {
      console.error('[TERMII SMS] Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendOTP(phoneNumber: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await this.sendSMS(
      phoneNumber,
      `Your verification code is: ${otp}. Valid for 10 minutes.`
    );

    return otp;
  }

  async sendOrderNotification(phoneNumber: string, orderNumber: string, status: string) {
    const messages = {
      accepted: `Your order ${orderNumber} has been accepted and is being prepared.`,
      ready: `Your order ${orderNumber} is ready for pickup!`,
      picked_up: `Your order ${orderNumber} is on the way!`,
      delivered: `Your order ${orderNumber} has been delivered. Enjoy!`,
    };

    const message = messages[status] || `Order ${orderNumber} status: ${status}`;
    return this.sendSMS(phoneNumber, message);
  }
}
```

---

## 🔔 Step 12: Firebase Cloud Messaging (Push Notifications)

### Installation

```bash
npm install firebase-admin
```

### Setup

1. Go to Firebase Console
2. Create project
3. Download service account JSON
4. Add to `.env`:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

### Implementation

**File:** `backend/src/notifications/firebase.service.ts`

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private config: ConfigService) {}

  onModuleInit() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.config.get('FIREBASE_PROJECT_ID'),
        privateKey: this.config.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        clientEmail: this.config.get('FIREBASE_CLIENT_EMAIL'),
      }),
    });
  }

  async sendPushNotification(tokens: string[], title: string, body: string, data?: any) {
    const message = {
      notification: { title, body },
      data: data || {},
      tokens,
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log(`[FCM] Success: ${response.successCount}, Failed: ${response.failureCount}`);
      return response;
    } catch (error) {
      console.error('[FCM] Error:', error);
      throw error;
    }
  }
}
```

---

## 🚀 Quick Setup Checklist

### 1. Location Tracking
- ✅ Already implemented
- ✅ Database migrated
- ✅ Endpoints ready

### 2. Paystack
- [ ] Sign up at https://paystack.com
- [ ] Get API keys
- [ ] Add to `.env`
- [ ] Create payment service
- [ ] Test with test cards

### 3. Analytics
- [ ] Create analytics service
- [ ] Add endpoints
- [ ] Test dashboard stats

### 4. Admin Dashboard
- [ ] Create admin service
- [ ] Add role-based guards
- [ ] Test admin endpoints

### 5. Termii (SMS)
- [ ] Sign up at https://termii.com
- [ ] Get API key
- [ ] Add to `.env`
- [ ] Test SMS sending

### 6. Firebase (Push)
- [ ] Create Firebase project
- [ ] Download service account
- [ ] Add credentials to `.env`
- [ ] Test push notifications

---

## 📱 Mobile App Requirements

### For Drivers
- GPS permission
- Background location tracking
- Real-time location updates every 10-30 seconds
- Online/offline toggle

### For Customers
- Order tracking with live map
- Push notifications for order updates
- SMS notifications for critical updates

### For Business Owners
- Analytics dashboard
- Order management
- Revenue tracking

---

## 🇳🇬 Nigerian Market Specifics

### Payment
- Paystack (most popular in Nigeria)
- Support for cards, bank transfer, USSD
- NGN currency

### SMS
- Termii (Nigerian SMS provider)
- Reliable delivery
- Affordable rates

### Phone Numbers
- Format: +234XXXXXXXXXX
- Validate Nigerian phone numbers

### Locations
- Major cities: Lagos, Abuja, Port Harcourt, Ibadan, Kano
- Use Nigerian postal codes
- Support for local landmarks

---

**All critical features are now documented and ready for implementation!** 🎉
