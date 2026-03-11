# Backend Specification - Fulccrum Super-App

## 🎯 Overview

This document contains all backend changes needed to transform Fulccrum into a super-app. The frontend team will handle UI/UX while you implement these backend features.

---

## 📦 PHASE 1: Package Delivery (Ride-Hailing Model)

### **Database Migrations**

#### **Migration 1: Extend Order Model**

**File:** `backend/prisma/schema.prisma`

```prisma
model Order {
  id              String      @id @default(uuid())
  
  // Add order type discrimination
  orderType       OrderType   @default(food_delivery)
  
  // Existing fields for food delivery
  customerId      String
  merchantId      String?     // Null for package delivery
  courierId       String?
  totalAmount     Decimal
  status          OrderStatus
  deliveryAddress Json
  items           OrderItem[]
  
  // NEW: Package delivery fields
  pickupLocation  Json?       // { lat: number, lng: number, address: string, contactName: string, contactPhone: string }
  dropoffLocation Json?       // { lat: number, lng: number, address: string, contactName: string, contactPhone: string }
  packageSize     PackageSize?
  packageWeight   Float?      // in kg
  packagePhoto    String?     // URL to photo taken at pickup
  deliverySpeed   DeliverySpeed?
  packageDescription String?
  specialInstructions String?
  
  // NEW: Pricing breakdown
  basePrice       Decimal?    // Base delivery fee
  distancePrice   Decimal?    // Distance-based fee
  sizeMultiplier  Float?      // 1.0, 1.5, or 2.0
  surgeFactor     Float?      // 1.0 - 2.0
  
  // Timestamps
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  acceptedAt      DateTime?
  pickedUpAt      DateTime?
  deliveredAt     DateTime?
  
  customer        User        @relation("CustomerOrders", fields: [customerId], references: [id])
  merchant        Business?   @relation(fields: [merchantId], references: [id])
  courier         User?       @relation("CourierOrders", fields: [courierId], references: [id])
  deliveryRequest DeliveryRequest?
  
  @@index([customerId, createdAt])
  @@index([courierId, status])
  @@index([orderType, status])
  @@map("orders")
}

enum OrderType {
  food_delivery
  package_delivery
  service_booking
  product_delivery
}

enum PackageSize {
  small    // < 5kg, fits in backpack
  medium   // 5-15kg, small box
  large    // 15-30kg, large box
}

enum DeliverySpeed {
  express      // 30-60 minutes
  same_day     // 2-4 hours
  scheduled    // User picks specific time
}
```

#### **Migration 2: Courier Location Tracking**

```prisma
model CourierLocation {
  id          String   @id @default(uuid())
  courierId   String
  latitude    Float
  longitude   Float
  heading     Float?   // Compass direction (0-360)
  speed       Float?   // km/h
  accuracy    Float?   // GPS accuracy in meters
  timestamp   DateTime @default(now())
  
  courier     User     @relation("CourierLocations", fields: [courierId], references: [id])
  
  @@index([courierId, timestamp])
  @@map("courier_locations")
}
```

#### **Migration 3: Delivery Request Queue**

```prisma
model DeliveryRequest {
  id              String        @id @default(uuid())
  orderId         String        @unique
  
  // Request details
  pickupLocation  Json          // { lat, lng, address }
  dropoffLocation Json          // { lat, lng, address }
  packageSize     PackageSize
  estimatedPrice  Decimal
  estimatedDistance Float       // in km
  
  // Request lifecycle
  status          RequestStatus @default(pending)
  requestedAt     DateTime      @default(now())
  expiresAt       DateTime      // 5 minutes from request
  
  // Courier matching
  sentToCouriers  String[]      // Array of courier IDs
  rejectedBy      String[]      // Couriers who declined
  acceptedBy      String?       // Courier who accepted
  acceptedAt      DateTime?
  
  order           Order         @relation(fields: [orderId], references: [id])
  
  @@index([status, expiresAt])
  @@index([acceptedBy])
  @@map("delivery_requests")
}

enum RequestStatus {
  pending       // Waiting for courier
  accepted      // Courier accepted
  expired       // No courier accepted in time
  cancelled     // Customer cancelled
}
```

**Run migrations:**
```bash
cd backend
npx prisma migrate dev --name add_package_delivery_support
npx prisma generate
```

---

### **New Module: PackageDeliveryModule**

#### **File Structure:**
```
backend/src/package-delivery/
├── package-delivery.module.ts
├── package-delivery.controller.ts
├── package-delivery.service.ts
├── courier-matching.service.ts
├── pricing.service.ts
├── location.service.ts
├── package-delivery.gateway.ts
├── dto/
│   ├── calculate-price.dto.ts
│   ├── request-delivery.dto.ts
│   ├── update-location.dto.ts
│   ├── accept-delivery.dto.ts
│   └── rate-delivery.dto.ts
└── jobs/
    ├── request-timeout.job.ts
    └── location-cleanup.job.ts
```

---

### **1. Module Definition**

**File:** `backend/src/package-delivery/package-delivery.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { PackageDeliveryController } from './package-delivery.controller';
import { PackageDeliveryService } from './package-delivery.service';
import { CourierMatchingService } from './courier-matching.service';
import { PricingService } from './pricing.service';
import { LocationService } from './location.service';
import { PackageDeliveryGateway } from './package-delivery.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PrismaModule, NotificationsModule, PaymentModule],
  controllers: [PackageDeliveryController],
  providers: [
    PackageDeliveryService,
    CourierMatchingService,
    PricingService,
    LocationService,
    PackageDeliveryGateway,
  ],
  exports: [PackageDeliveryService],
})
export class PackageDeliveryModule {}
```

---

### **2. Controller**

**File:** `backend/src/package-delivery/package-delivery.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PackageDeliveryService } from './package-delivery.service';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { RequestDeliveryDto } from './dto/request-delivery.dto';
import { RateDeliveryDto } from './dto/rate-delivery.dto';

@Controller('package-delivery')
@UseGuards(JwtAuthGuard)
export class PackageDeliveryController {
  constructor(
    private readonly packageDeliveryService: PackageDeliveryService,
  ) {}

  /**
   * Calculate delivery price
   * POST /package-delivery/calculate-price
   */
  @Post('calculate-price')
  async calculatePrice(@Body() dto: CalculatePriceDto) {
    const pricing = await this.packageDeliveryService.calculatePrice(
      dto.pickup,
      dto.dropoff,
      dto.size,
      dto.speed,
    );
    
    return {
      success: true,
      data: pricing,
    };
  }

  /**
   * Request package delivery
   * POST /package-delivery/request
   */
  @Post('request')
  async requestDelivery(
    @Request() req: any,
    @Body() dto: RequestDeliveryDto,
  ) {
    const delivery = await this.packageDeliveryService.requestDelivery(
      req.user.id,
      dto,
    );
    
    return {
      success: true,
      message: 'Delivery request created. Finding nearby couriers...',
      data: delivery,
    };
  }

  /**
   * Get delivery status and tracking
   * GET /package-delivery/:id/status
   */
  @Get(':id/status')
  async getDeliveryStatus(@Param('id') id: string) {
    const status = await this.packageDeliveryService.getDeliveryStatus(id);
    
    return {
      success: true,
      data: status,
    };
  }

  /**
   * Cancel delivery
   * POST /package-delivery/:id/cancel
   */
  @Post(':id/cancel')
  async cancelDelivery(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.packageDeliveryService.cancelDelivery(id, req.user.id);
    
    return {
      success: true,
      message: 'Delivery cancelled successfully',
    };
  }

  /**
   * Rate delivery
   * POST /package-delivery/:id/rate
   */
  @Post(':id/rate')
  async rateDelivery(
    @Param('id') id: string,
    @Body() dto: RateDeliveryDto,
  ) {
    await this.packageDeliveryService.rateDelivery(
      id,
      dto.rating,
      dto.feedback,
    );
    
    return {
      success: true,
      message: 'Thank you for your feedback!',
    };
  }

  /**
   * Get delivery history
   * GET /package-delivery/history
   */
  @Get('history')
  async getHistory(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const history = await this.packageDeliveryService.getHistory(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
    
    return {
      success: true,
      data: history,
    };
  }
}
```

---

### **3. Main Service**

**File:** `backend/src/package-delivery/package-delivery.service.ts`

```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from './pricing.service';
import { CourierMatchingService } from './courier-matching.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RequestDeliveryDto } from './dto/request-delivery.dto';

@Injectable()
export class PackageDeliveryService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
    private courierMatching: CourierMatchingService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Calculate delivery price
   */
  async calculatePrice(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number },
    size: string,
    speed: string,
  ) {
    return this.pricingService.calculateDeliveryPrice(
      pickup,
      dropoff,
      size,
      speed,
    );
  }

  /**
   * Request package delivery
   */
  async requestDelivery(customerId: string, dto: RequestDeliveryDto) {
    // Calculate price
    const pricing = await this.pricingService.calculateDeliveryPrice(
      { lat: dto.pickupLocation.lat, lng: dto.pickupLocation.lng },
      { lat: dto.dropoffLocation.lat, lng: dto.dropoffLocation.lng },
      dto.packageSize,
      dto.deliverySpeed,
    );

    // Create order
    const order = await this.prisma.order.create({
      data: {
        orderType: 'package_delivery',
        customerId,
        pickupLocation: dto.pickupLocation,
        dropoffLocation: dto.dropoffLocation,
        packageSize: dto.packageSize,
        packageWeight: dto.packageWeight,
        packageDescription: dto.packageDescription,
        deliverySpeed: dto.deliverySpeed,
        specialInstructions: dto.specialInstructions,
        totalAmount: pricing.totalPrice,
        basePrice: pricing.basePrice,
        distancePrice: pricing.distancePrice,
        sizeMultiplier: pricing.sizeMultiplier,
        surgeFactor: pricing.surgeFactor,
        status: 'pending',
      },
    });

    // Create delivery request
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 min timeout

    const deliveryRequest = await this.prisma.deliveryRequest.create({
      data: {
        orderId: order.id,
        pickupLocation: dto.pickupLocation,
        dropoffLocation: dto.dropoffLocation,
        packageSize: dto.packageSize,
        estimatedPrice: pricing.totalPrice,
        estimatedDistance: pricing.distance,
        expiresAt,
      },
    });

    // Find and notify nearby couriers
    await this.courierMatching.findAndNotifyCouriers(deliveryRequest);

    return {
      orderId: order.id,
      requestId: deliveryRequest.id,
      estimatedPrice: pricing.totalPrice,
      distance: pricing.distance,
      expiresAt,
    };
  }

  /**
   * Get delivery status with courier location
   */
  async getDeliveryStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        courier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            avatarUrl: true,
          },
        },
        deliveryRequest: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Delivery not found');
    }

    let courierLocation = null;
    if (order.courierId) {
      // Get latest courier location
      courierLocation = await this.prisma.courierLocation.findFirst({
        where: { courierId: order.courierId },
        orderBy: { timestamp: 'desc' },
      });
    }

    return {
      order,
      courierLocation,
      eta: courierLocation ? this.calculateETA(courierLocation, order) : null,
    };
  }

  /**
   * Cancel delivery
   */
  async cancelDelivery(orderId: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Delivery not found');
    }

    if (order.customerId !== customerId) {
      throw new BadRequestException('Unauthorized');
    }

    if (order.status === 'delivered') {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    // Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });

    // Update delivery request
    await this.prisma.deliveryRequest.updateMany({
      where: { orderId },
      data: { status: 'cancelled' },
    });

    // Notify courier if assigned
    if (order.courierId) {
      await this.notifications.sendPushNotification(
        order.courierId,
        'Delivery Cancelled',
        'The customer has cancelled the delivery',
      );
    }
  }

  /**
   * Rate delivery
   */
  async rateDelivery(orderId: string, rating: number, feedback: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.courierId) {
      throw new NotFoundException('Delivery not found');
    }

    // Create review (reuse existing review system or create new)
    // Update courier rating
    await this.updateCourierRating(order.courierId, rating);
  }

  /**
   * Get delivery history
   */
  async getHistory(customerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [deliveries, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          customerId,
          orderType: 'package_delivery',
        },
        include: {
          courier: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({
        where: {
          customerId,
          orderType: 'package_delivery',
        },
      }),
    ]);

    return {
      deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private calculateETA(courierLocation: any, order: any): number {
    // Calculate ETA based on courier location and destination
    // This is a simplified version - use Google Maps Distance Matrix API for accuracy
    const avgSpeed = 30; // km/h
    const distance = this.calculateDistance(
      courierLocation.latitude,
      courierLocation.longitude,
      order.dropoffLocation.lat,
      order.dropoffLocation.lng,
    );
    return Math.ceil((distance / avgSpeed) * 60); // minutes
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async updateCourierRating(courierId: string, newRating: number) {
    // Update courier's average rating
    // This is simplified - implement proper rating calculation
  }
}
```

---

### **4. Pricing Service**

**File:** `backend/src/package-delivery/pricing.service.ts`

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class PricingService {
  private readonly BASE_PRICE = 500; // ₦500 base fee
  private readonly PRICE_PER_KM = 100; // ₦100 per km
  
  private readonly SIZE_MULTIPLIERS = {
    small: 1.0,
    medium: 1.5,
    large: 2.0,
  };

  /**
   * Calculate delivery price with all factors
   */
  async calculateDeliveryPrice(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number },
    size: string,
    speed: string,
  ) {
    // Calculate distance
    const distance = this.calculateDistance(
      pickup.lat,
      pickup.lng,
      dropoff.lat,
      dropoff.lng,
    );

    // Base price + distance price
    let price = this.BASE_PRICE + distance * this.PRICE_PER_KM;

    // Apply size multiplier
    const sizeMultiplier = this.SIZE_MULTIPLIERS[size] || 1.0;
    price *= sizeMultiplier;

    // Apply speed multiplier
    let speedMultiplier = 1.0;
    if (speed === 'express') {
      speedMultiplier = 1.3; // 30% more for express
    }
    price *= speedMultiplier;

    // Apply surge pricing
    const surgeFactor = await this.calculateSurgeFactor(pickup);
    price *= surgeFactor;

    return {
      basePrice: this.BASE_PRICE,
      distancePrice: distance * this.PRICE_PER_KM,
      sizeMultiplier,
      speedMultiplier,
      surgeFactor,
      distance: parseFloat(distance.toFixed(2)),
      totalPrice: parseFloat(price.toFixed(2)),
      breakdown: {
        base: this.BASE_PRICE,
        distance: distance * this.PRICE_PER_KM,
        sizeAdjustment: (sizeMultiplier - 1) * 100, // % increase
        speedAdjustment: (speedMultiplier - 1) * 100,
        surgeAdjustment: (surgeFactor - 1) * 100,
      },
    };
  }

  /**
   * Calculate surge pricing factor
   */
  private async calculateSurgeFactor(location: { lat: number; lng: number }): Promise<number> {
    const hour = new Date().getHours();
    const day = new Date().getDay();

    // Peak hours: 7-9am, 5-8pm on weekdays
    const isPeakHour =
      (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
    const isWeekday = day >= 1 && day <= 5;

    if (isPeakHour && isWeekday) {
      return 1.3; // 30% surge
    }

    // Weekend evenings
    if (!isWeekday && hour >= 18 && hour <= 22) {
      return 1.2; // 20% surge
    }

    // Check demand in area (simplified - implement proper demand tracking)
    // const demand = await this.getAreaDemand(location);
    // if (demand > threshold) return 1.5;

    return 1.0; // No surge
  }

  /**
   * Calculate distance using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
```

---

### **5. Courier Matching Service**

**File:** `backend/src/package-delivery/courier-matching.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CourierMatchingService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Find nearby couriers and send delivery requests
   */
  async findAndNotifyCouriers(deliveryRequest: any) {
    const pickupLocation = deliveryRequest.pickupLocation;
    const radius = 5; // 5km radius

    // Find online couriers within radius
    const couriers = await this.findNearbyCouriers(
      pickupLocation.lat,
      pickupLocation.lng,
      radius,
    );

    if (couriers.length === 0) {
      // No couriers available - expand search or notify customer
      return;
    }

    // Send request to top 3 closest couriers
    const selectedCouriers = couriers.slice(0, 3);
    const courierIds = selectedCouriers.map((c) => c.id);

    // Update delivery request with sent couriers
    await this.prisma.deliveryRequest.update({
      where: { id: deliveryRequest.id },
      data: { sentToCouriers: courierIds },
    });

    // Send push notifications
    for (const courier of selectedCouriers) {
      await this.notifications.sendPushNotification(
        courier.id,
        'New Delivery Request',
        `Package delivery: ₦${deliveryRequest.estimatedPrice} • ${deliveryRequest.estimatedDistance}km`,
        {
          type: 'delivery_request',
          requestId: deliveryRequest.id,
          orderId: deliveryRequest.orderId,
        },
      );
    }
  }

  /**
   * Find nearby online couriers
   */
  private async findNearbyCouriers(
    lat: number,
    lng: number,
    radiusKm: number,
  ) {
    // Get all online couriers
    const onlineCouriers = await this.prisma.user.findMany({
      where: {
        role: 'courier',
        courierProfile: {
          isOnline: true,
          isAvailable: true,
        },
      },
      include: {
        courierProfile: true,
      },
    });

    // Get latest location for each courier
    const couriersWithDistance = await Promise.all(
      onlineCouriers.map(async (courier) => {
        const location = await this.prisma.courierLocation.findFirst({
          where: { courierId: courier.id },
          orderBy: { timestamp: 'desc' },
        });

        if (!location) return null;

        const distance = this.calculateDistance(
          lat,
          lng,
          location.latitude,
          location.longitude,
        );

        if (distance > radiusKm) return null;

        return {
          ...courier,
          distance,
          location,
        };
      }),
    );

    // Filter out nulls and sort by distance
    return couriersWithDistance
      .filter((c) => c !== null)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Handle courier acceptance
   */
  async handleCourierAcceptance(requestId: string, courierId: string) {
    const request = await this.prisma.deliveryRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== 'pending') {
      return { success: false, message: 'Request no longer available' };
    }

    // Update request
    await this.prisma.deliveryRequest.update({
      where: { id: requestId },
      data: {
        status: 'accepted',
        acceptedBy: courierId,
        acceptedAt: new Date(),
      },
    });

    // Update order
    await this.prisma.order.update({
      where: { id: request.orderId },
      data: {
        courierId,
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });

    // Notify customer
    const order = await this.prisma.order.findUnique({
      where: { id: request.orderId },
      include: { courier: true },
    });

    await this.notifications.sendPushNotification(
      order.customerId,
      'Courier Found!',
      `${order.courier.firstName} is on the way to pickup your package`,
    );

    // Notify other couriers that request is taken
    const otherCouriers = request.sentToCouriers.filter((id) => id !== courierId);
    for (const id of otherCouriers) {
      await this.notifications.sendPushNotification(
        id,
        'Request Taken',
        'Another courier accepted this delivery',
      );
    }

    return { success: true };
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
```

---

### **6. WebSocket Gateway**

**File:** `backend/src/package-delivery/package-delivery.gateway.ts`

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { CourierMatchingService } from './courier-matching.service';

@WebSocketGateway({ cors: true })
export class PackageDeliveryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private courierSockets = new Map<string, string>(); // courierId -> socketId

  constructor(
    private prisma: PrismaService,
    private courierMatching: CourierMatchingService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove from courier sockets
    for (const [courierId, socketId] of this.courierSockets.entries()) {
      if (socketId === client.id) {
        this.courierSockets.delete(courierId);
        break;
      }
    }
  }

  /**
   * Courier registers their socket for real-time updates
   */
  @SubscribeMessage('courier-register')
  handleCourierRegister(client: Socket, data: { courierId: string }) {
    this.courierSockets.set(data.courierId, client.id);
    client.join(`courier-${data.courierId}`);
  }

  /**
   * Customer joins room to track their delivery
   */
  @SubscribeMessage('track-delivery')
  handleTrackDelivery(client: Socket, data: { orderId: string }) {
    client.join(`delivery-${data.orderId}`);
  }

  /**
   * Courier sends location update
   */
  @SubscribeMessage('courier-location-update')
  async handleLocationUpdate(
    client: Socket,
    data: {
      courierId: string;
      lat: number;
      lng: number;
      heading?: number;
      speed?: number;
    },
  ) {
    // Save location to database
    await this.prisma.courierLocation.create({
      data: {
        courierId: data.courierId,
        latitude: data.lat,
        longitude: data.lng,
        heading: data.heading,
        speed: data.speed,
      },
    });

    // Find active deliveries for this courier
    const activeDeliveries = await this.prisma.order.findMany({
      where: {
        courierId: data.courierId,
        status: { in: ['accepted', 'picked_up'] },
        orderType: 'package_delivery',
      },
    });

    // Broadcast location to customers tracking these deliveries
    for (const delivery of activeDeliveries) {
      this.server.to(`delivery-${delivery.id}`).emit('courier-moved', {
        lat: data.lat,
        lng: data.lng,
        heading: data.heading,
        speed: data.speed,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Courier accepts delivery request
   */
  @SubscribeMessage('accept-delivery')
  async handleAcceptDelivery(
    client: Socket,
    data: { requestId: string; courierId: string },
  ) {
    const result = await this.courierMatching.handleCourierAcceptance(
      data.requestId,
      data.courierId,
    );

    if (result.success) {
      const request = await this.prisma.deliveryRequest.findUnique({
        where: { id: data.requestId },
        include: { order: true },
      });

      // Notify customer
      this.server.to(`delivery-${request.orderId}`).emit('courier-assigned', {
        courierId: data.courierId,
        message: 'Courier is on the way!',
      });
    }

    client.emit('accept-delivery-response', result);
  }

  /**
   * Update delivery status
   */
  @SubscribeMessage('update-delivery-status')
  async handleStatusUpdate(
    client: Socket,
    data: {
      orderId: string;
      status: string;
      photoUrl?: string;
    },
  ) {
    await this.prisma.order.update({
      where: { id: data.orderId },
      data: {
        status: data.status,
        ...(data.status === 'picked_up' && { pickedUpAt: new Date(), packagePhoto: data.photoUrl }),
        ...(data.status === 'delivered' && { deliveredAt: new Date() }),
      },
    });

    // Notify customer
    this.server.to(`delivery-${data.orderId}`).emit('status-updated', {
      status: data.status,
      timestamp: new Date(),
    });
  }
}
```

---

### **7. DTOs**

**File:** `backend/src/package-delivery/dto/calculate-price.dto.ts`

```typescript
import { IsObject, IsEnum, IsNotEmpty } from 'class-validator';

export class CalculatePriceDto {
  @IsObject()
  @IsNotEmpty()
  pickup: { lat: number; lng: number };

  @IsObject()
  @IsNotEmpty()
  dropoff: { lat: number; lng: number };

  @IsEnum(['small', 'medium', 'large'])
  size: string;

  @IsEnum(['express', 'same_day', 'scheduled'])
  speed: string;
}
```

**File:** `backend/src/package-delivery/dto/request-delivery.dto.ts`

```typescript
import {
  IsObject,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  address: string;

  @IsString()
  contactName: string;

  @IsString()
  contactPhone: string;
}

export class RequestDeliveryDto {
  @ValidateNested()
  @Type(() => LocationDto)
  pickupLocation: LocationDto;

  @ValidateNested()
  @Type(() => LocationDto)
  dropoffLocation: LocationDto;

  @IsEnum(['small', 'medium', 'large'])
  packageSize: string;

  @IsEnum(['express', 'same_day', 'scheduled'])
  deliverySpeed: string;

  @IsOptional()
  @IsString()
  packageDescription?: string;

  @IsOptional()
  @IsNumber()
  packageWeight?: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}
```

---

### **8. Background Jobs**

**File:** `backend/src/package-delivery/jobs/request-timeout.job.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class RequestTimeoutJob {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Run every minute to check for expired delivery requests
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredRequests() {
    const now = new Date();

    // Find expired pending requests
    const expiredRequests = await this.prisma.deliveryRequest.findMany({
      where: {
        status: 'pending',
        expiresAt: { lte: now },
      },
      include: { order: true },
    });

    for (const request of expiredRequests) {
      // Mark as expired
      await this.prisma.deliveryRequest.update({
        where: { id: request.id },
        data: { status: 'expired' },
      });

      // Cancel order
      await this.prisma.order.update({
        where: { id: request.orderId },
        data: { status: 'cancelled' },
      });

      // Notify customer
      await this.notifications.sendPushNotification(
        request.order.customerId,
        'No Courier Available',
        'Sorry, no couriers are available right now. Please try again.',
      );

      // Refund if payment was made
      // await this.paymentService.refund(request.orderId);
    }

    if (expiredRequests.length > 0) {
      console.log(`Expired ${expiredRequests.length} delivery requests`);
    }
  }
}
```

---

## 🚀 Implementation Steps for Backend Team

### **Week 1: Database & Module Setup**
1. Add new enums and fields to Prisma schema
2. Run migrations
3. Create PackageDeliveryModule structure
4. Set up basic controller and service

### **Week 2: Core Services**
1. Implement PricingService
2. Implement CourierMatchingService
3. Implement LocationService
4. Add all DTOs

### **Week 3: API Endpoints**
1. Implement all controller methods
2. Add validation
3. Add error handling
4. Test with Postman

### **Week 4: Real-time Features**
1. Implement WebSocket gateway
2. Add location tracking
3. Add courier matching notifications
4. Test real-time updates

### **Week 5: Background Jobs & Polish**
1. Implement timeout job
2. Implement cleanup job
3. Add logging
4. Performance optimization
5. Security review

### **Week 6: Testing & Documentation**
1. Unit tests
2. Integration tests
3. API documentation
4. Deploy to staging

---

## 📞 Questions for Backend Team

1. **Redis** - Do we have Redis set up for caching courier locations?
2. **Push Notifications** - Is Firebase Cloud Messaging configured?
3. **Maps API** - Should we integrate Google Maps Distance Matrix API for accurate ETA?
4. **Payment** - How should we handle payment for package delivery? (Upfront vs on delivery)
5. **Refunds** - What's the refund policy if no courier is found?

---

**Ready to start? Let's build this! 🚀**
