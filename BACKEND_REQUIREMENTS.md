# Backend API Requirements for Package Delivery

## Overview
This document outlines all backend endpoints and database models required to replace the mock implementation with a fully functional package delivery system.

---

## 1. Database Models (Prisma Schema)

### PackageDelivery Model
```prisma
model PackageDelivery {
  id                  String   @id @default(uuid())
  customerId          String
  courierId           String?
  
  // Locations
  pickupLatitude      Float
  pickupLongitude     Float
  pickupAddress       String
  pickupContactName   String
  pickupContactPhone  String
  
  dropoffLatitude     Float
  dropoffLongitude    Float
  dropoffAddress      String
  dropoffContactName  String
  dropoffContactPhone String
  
  // Package Details
  packageSize         PackageSize
  deliverySpeed       DeliverySpeed
  packageDescription  String?
  packageWeight       Float?
  specialInstructions String?
  packagePhotoUrl     String?
  
  // Pricing
  basePrice           Float
  distancePrice       Float
  sizeMultiplier      Float
  speedMultiplier     Float
  surgeFactor         Float
  totalPrice          Float
  distance            Float
  
  // Status & Tracking
  status              DeliveryStatus  @default(PENDING)
  requestId           String          @unique
  expiresAt           DateTime
  
  // Timestamps
  createdAt           DateTime        @default(now())
  acceptedAt          DateTime?
  pickedUpAt          DateTime?
  deliveredAt         DateTime?
  cancelledAt         DateTime?
  
  // Relationships
  customer            User            @relation("CustomerDeliveries", fields: [customerId], references: [id])
  courier             User?           @relation("CourierDeliveries", fields: [courierId], references: [id])
  rating              DeliveryRating?
  
  @@index([customerId])
  @@index([courierId])
  @@index([status])
  @@index([createdAt])
}

enum PackageSize {
  SMALL
  MEDIUM
  LARGE
}

enum DeliverySpeed {
  EXPRESS
  SAME_DAY
  SCHEDULED
}

enum DeliveryStatus {
  PENDING
  SEARCHING
  ACCEPTED
  PICKED_UP
  IN_TRANSIT
  DELIVERED
  CANCELLED
}
```

### DeliveryRating Model
```prisma
model DeliveryRating {
  id          String          @id @default(uuid())
  deliveryId  String          @unique
  rating      Int             // 1-5
  feedback    String?
  createdAt   DateTime        @default(now())
  
  delivery    PackageDelivery @relation(fields: [deliveryId], references: [id])
}
```

### CourierLocation Model (Real-time tracking)
```prisma
model CourierLocation {
  id          String   @id @default(uuid())
  courierId   String
  latitude    Float
  longitude   Float
  heading     Float?
  speed       Float?
  accuracy    Float?
  timestamp   DateTime @default(now())
  
  courier     User     @relation(fields: [courierId], references: [id])
  
  @@index([courierId])
  @@index([timestamp])
}
```

---

## 2. API Endpoints

### 2.1 Calculate Price
**POST** `/package-delivery/calculate-price`

**Request Body:**
```typescript
{
  pickup: {
    lat: number;
    lng: number;
  };
  dropoff: {
    lat: number;
    lng: number;
  };
  size: 'small' | 'medium' | 'large';
  speed: 'express' | 'same_day' | 'scheduled';
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    basePrice: number;
    distancePrice: number;
    sizeMultiplier: number;
    speedMultiplier: number;
    surgeFactor: number;
    distance: number;
    totalPrice: number;
    breakdown: {
      base: number;
      distance: number;
      sizeAdjustment: number;
      speedAdjustment: number;
      surgeAdjustment: number;
    };
  }
}
```

**Implementation Requirements:**
- Use Haversine formula or Google Maps Distance Matrix API for distance calculation
- Pricing formula:
  ```
  BASE_PRICE = 500
  PRICE_PER_KM = 80
  SIZE_MULTIPLIERS = { small: 1, medium: 1.3, large: 1.6 }
  SPEED_MULTIPLIERS = { same_day: 1, express: 1.5, scheduled: 0.8 }
  SURGE_FACTOR = Calculate based on current demand (1.0 - 2.0)
  
  TOTAL = (BASE_PRICE + (distance * PRICE_PER_KM)) * SIZE_MULTIPLIER * SPEED_MULTIPLIER * SURGE_FACTOR
  ```
- Calculate surge factor based on:
  - Number of active orders in the area
  - Number of available couriers
  - Time of day (peak hours: 12-2pm, 6-9pm)
  - Day of week (weekends higher)

---

### 2.2 Request Delivery
**POST** `/package-delivery/request`

**Request Body:**
```typescript
{
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
    contactName: string;
    contactPhone: string;
  };
  dropoffLocation: {
    lat: number;
    lng: number;
    address: string;
    contactName: string;
    contactPhone: string;
  };
  packageSize: 'small' | 'medium' | 'large';
  deliverySpeed: 'express' | 'same_day' | 'scheduled';
  packageDescription?: string;
  packageWeight?: number;
  specialInstructions?: string;
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Delivery request created successfully',
  data: {
    orderId: string;
    requestId: string;
    estimatedPrice: number;
    distance: number;
    expiresAt: string; // ISO timestamp
  }
}
```

**Implementation Requirements:**
1. Create PackageDelivery record with status PENDING
2. Calculate price using same logic as calculate-price endpoint
3. Generate unique requestId
4. Set expiresAt to 5 minutes from now
5. Trigger courier matching algorithm (see section 3)
6. Return order details

---

### 2.3 Get Delivery Status
**GET** `/package-delivery/:orderId/status`

**Response:**
```typescript
{
  success: true,
  data: {
    order: {
      id: string;
      orderType: 'PACKAGE_DELIVERY';
      status: DeliveryStatus;
      pickupLocation: Location;
      dropoffLocation: Location;
      packageSize: string;
      deliverySpeed: string;
      totalAmount: number;
      createdAt: string;
      acceptedAt?: string;
      pickedUpAt?: string;
      deliveredAt?: string;
      courier?: {
        id: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        avatarUrl?: string;
        rating: number;
        totalDeliveries: number;
      };
    };
    courierLocation?: {
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
      timestamp: string;
    };
    eta?: number; // minutes
  }
}
```

**Implementation Requirements:**
- Fetch delivery with courier details
- If courier assigned, fetch latest CourierLocation
- Calculate ETA based on:
  - Distance from courier to pickup (if not picked up)
  - Distance from courier to dropoff (if picked up)
  - Average speed
  - Traffic conditions (if using Google Maps API)

---

### 2.4 Cancel Delivery
**POST** `/package-delivery/:orderId/cancel`

**Response:**
```typescript
{
  success: true,
  message: 'Delivery cancelled successfully'
}
```

**Implementation Requirements:**
- Check if delivery can be cancelled (status must be PENDING or SEARCHING)
- If courier already accepted, notify courier
- Update status to CANCELLED
- Process refund if payment was made
- Set cancelledAt timestamp

---

### 2.5 Rate Delivery
**POST** `/package-delivery/:orderId/rate`

**Request Body:**
```typescript
{
  rating: number; // 1-5
  feedback?: string;
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Rating submitted successfully'
}
```

**Implementation Requirements:**
- Validate delivery is DELIVERED
- Create DeliveryRating record
- Update courier's average rating
- Send thank you notification to customer

---

### 2.6 Get Delivery History
**GET** `/package-delivery/history?page=1&limit=20`

**Response:**
```typescript
{
  success: true,
  data: {
    deliveries: Array<{
      id: string;
      status: string;
      pickupLocation: Location;
      dropoffLocation: Location;
      packageSize: string;
      totalAmount: number;
      createdAt: string;
      deliveredAt?: string;
      courier?: {
        firstName: string;
        lastName: string;
        avatarUrl?: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }
}
```

---

## 3. Courier Matching Algorithm

### 3.1 Matching Logic
```typescript
async function findCourier(deliveryId: string) {
  const delivery = await getDelivery(deliveryId);
  
  // 1. Find available couriers within radius
  const radius = 5; // km initially
  const availableCouriers = await findCouriersInRadius(
    delivery.pickupLatitude,
    delivery.pickupLongitude,
    radius
  );
  
  // 2. Filter by criteria
  const eligibleCouriers = availableCouriers.filter(courier => {
    return (
      courier.isOnline &&
      !courier.currentDeliveryId &&
      courier.vehicleType.canCarry(delivery.packageSize) &&
      courier.rating >= 4.0
    );
  });
  
  // 3. Sort by priority
  const sortedCouriers = eligibleCouriers.sort((a, b) => {
    // Distance to pickup (closest first)
    const distanceA = calculateDistance(a.location, delivery.pickup);
    const distanceB = calculateDistance(b.location, delivery.pickup);
    
    if (distanceA !== distanceB) return distanceA - distanceB;
    
    // Rating (highest first)
    if (a.rating !== b.rating) return b.rating - a.rating;
    
    // Acceptance rate (highest first)
    return b.acceptanceRate - a.acceptanceRate;
  });
  
  // 4. Broadcast to top 10 couriers
  const topCouriers = sortedCouriers.slice(0, 10);
  await broadcastDeliveryRequest(delivery, topCouriers);
  
  // 5. Wait for acceptance (30 seconds)
  const accepted = await waitForAcceptance(delivery.id, 30000);
  
  if (!accepted) {
    // 6. Expand radius and retry
    if (radius < 20) {
      return findCourier(deliveryId, radius + 5);
    } else {
      // No courier available
      await updateDeliveryStatus(deliveryId, 'CANCELLED');
      await notifyCustomer(delivery.customerId, 'NO_COURIER_AVAILABLE');
    }
  }
}
```

### 3.2 Real-time Broadcasting
Use WebSocket or Firebase Cloud Messaging to send delivery requests to couriers:

```typescript
interface DeliveryRequest {
  requestId: string;
  orderId: string;
  pickup: Location;
  dropoff: Location;
  distance: number;
  estimatedEarnings: number;
  packageSize: string;
  deliverySpeed: string;
  expiresAt: string;
}

// Send to courier app
await fcm.send({
  token: courier.fcmToken,
  notification: {
    title: 'New Delivery Request',
    body: `₦${estimatedEarnings} • ${distance}km`,
  },
  data: deliveryRequest,
});
```

---

## 4. Real-time Location Tracking

### 4.1 Courier Location Updates
**POST** `/courier/location/update`

**Request Body:**
```typescript
{
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
}
```

**Implementation:**
- Create CourierLocation record
- Broadcast to customers tracking this courier
- Calculate updated ETA
- Trigger geofence events (arrived at pickup, arrived at dropoff)

### 4.2 WebSocket Events
```typescript
// Customer subscribes to delivery updates
socket.on('subscribe:delivery', { orderId });

// Server sends updates
socket.emit('delivery:status', { status: 'PICKED_UP' });
socket.emit('courier:location', { lat, lng, heading, speed });
socket.emit('delivery:eta', { minutes: 15 });
```

---

## 5. Additional Features

### 5.1 Surge Pricing Calculation
```typescript
function calculateSurgeFactor(pickup: Location, time: Date): number {
  const hour = time.getHours();
  const dayOfWeek = time.getDay();
  
  // Base surge
  let surge = 1.0;
  
  // Peak hours (12-2pm, 6-9pm)
  if ((hour >= 12 && hour < 14) || (hour >= 18 && hour < 21)) {
    surge += 0.3;
  }
  
  // Weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    surge += 0.2;
  }
  
  // High demand area
  const activeOrders = await countActiveOrdersInRadius(pickup, 5);
  const availableCouriers = await countAvailableCouriersInRadius(pickup, 5);
  
  const demandRatio = activeOrders / Math.max(availableCouriers, 1);
  if (demandRatio > 2) surge += 0.4;
  else if (demandRatio > 1.5) surge += 0.2;
  
  // Cap at 2.0x
  return Math.min(surge, 2.0);
}
```

### 5.2 ETA Calculation
```typescript
function calculateETA(
  courierLocation: Location,
  targetLocation: Location,
  averageSpeed: number = 30 // km/h
): number {
  const distance = calculateDistance(courierLocation, targetLocation);
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = Math.ceil(timeInHours * 60);
  
  // Add buffer for traffic
  const buffer = Math.ceil(timeInMinutes * 0.2);
  
  return timeInMinutes + buffer;
}
```

---

## 6. Environment Variables

```env
# Google Maps API (for distance calculation)
GOOGLE_MAPS_API_KEY=your_api_key

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Pricing Configuration
BASE_DELIVERY_PRICE=500
PRICE_PER_KM=80
MAX_SURGE_MULTIPLIER=2.0

# Courier Matching
INITIAL_SEARCH_RADIUS_KM=5
MAX_SEARCH_RADIUS_KM=20
COURIER_ACCEPTANCE_TIMEOUT_SECONDS=30
MAX_COURIERS_TO_BROADCAST=10
```

---

## 7. Testing Checklist

- [ ] Price calculation matches mock service
- [ ] Courier matching finds nearest available courier
- [ ] Real-time location updates work
- [ ] ETA updates dynamically
- [ ] Surge pricing applies correctly
- [ ] Delivery status transitions properly
- [ ] Notifications sent at each stage
- [ ] Rating system works
- [ ] Delivery history pagination works
- [ ] Cancellation refunds processed

---

## 8. Migration from Mock to Real API

1. **Phase 1:** Implement database models
2. **Phase 2:** Create calculate-price endpoint
3. **Phase 3:** Create request-delivery endpoint
4. **Phase 4:** Implement courier matching algorithm
5. **Phase 5:** Add real-time tracking
6. **Phase 6:** Test end-to-end flow
7. **Phase 7:** Replace mock imports in frontend
8. **Phase 8:** Deploy and monitor

---

**Last Updated:** March 14, 2026
**Status:** Mock implementation complete, ready for backend development
