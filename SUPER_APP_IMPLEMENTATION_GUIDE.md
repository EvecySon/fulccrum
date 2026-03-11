# Fulccrum Super-App Implementation Guide

## 🎯 Project Overview

Transform Fulccrum from a food delivery app into a comprehensive super-app with 4 main categories:
1. **Food & Essentials** (existing - enhanced)
2. **Send Package** (ride-hailing for courier services)
3. **Services** (home services + health services)
4. **Gadgets** (e-commerce marketplace)

---

## 📱 UI/UX Design Inspiration

### **Apps to Study:**

**For Health Services:**
- **Zocdoc** - Doctor appointment booking, clean filters, availability calendar
- **Practo** - Indian health services app, excellent search and booking flow
- **Babylon Health** - Telemedicine interface, simple symptom checker

**For Home Services:**
- **TaskRabbit** - Service provider profiles, instant booking
- **Handy** - Clean service selection, transparent pricing
- **Urban Company** - Indian home services, beautiful UI

**For Package Delivery (Ride-Hailing):**
- **Lalamove** - Package delivery, excellent map interface
- **Gokada** - Nigerian courier service, local UX patterns
- **Uber** - Gold standard for ride-hailing UX

**For Overall Super-App:**
- **Grab** - Best-in-class super-app navigation
- **Gojek** - Category organization, service discovery
- **WeChat** - Seamless integration of multiple services

### **Key UX Principles:**
- ✅ **Simplicity** - No more than 3 taps to complete any action
- ✅ **Clarity** - Clear pricing, no hidden fees
- ✅ **Speed** - Fast loading, instant feedback
- ✅ **Trust** - Provider ratings, verified badges, reviews
- ✅ **Consistency** - Same design language across all categories

---

## 🏗️ Architecture Overview

### **Current State:**
```
Customer App
└── Food Delivery
    ├── 8 categories (Restaurant, Grocery, Pharmacy, etc.)
    ├── Browse merchants
    ├── Order food
    └── Courier delivers
```

### **Target State:**
```
Fulccrum Super-App
├── Food & Essentials
│   └── 8 categories (existing)
├── Send Package (NEW)
│   └── Ride-hailing model
├── Services (NEW)
│   ├── Home Services
│   └── Health Services
└── Gadgets (NEW)
    └── E-commerce
```

---

## 📋 PHASE 1: HOME SCREEN RESTRUCTURE + SEND PACKAGE

**Timeline:** 4-6 weeks  
**Priority:** HIGH

### **FRONTEND CHANGES**

#### **1. New/Modified Screens**

**File: `frontend/src/screens/customer/HomeScreen.tsx`**
- **Change:** Replace horizontal category scroll with 4-card grid
- **New Components:**
  - `CategoryCard` - Large card with icon, title, description
  - `QuickActions` - Below cards (Track order, Favorites, etc.)
- **Keep:** Search bar, trending items, nearby restaurants

**File: `frontend/src/screens/customer/FoodCategoriesScreen.tsx` (NEW)**
- **Purpose:** Shows 8 food categories when user taps "Food & Essentials"
- **Layout:** 2-column grid of category cards
- **Features:**
  - Category icons and names
  - Quick filters (Open now, Free delivery, etc.)
  - Search within categories
- **Navigation:** Taps go to existing `CategoryBrowseScreen`

**File: `frontend/src/screens/customer/SendPackageScreen.tsx` (NEW)**
- **Purpose:** Ride-hailing interface for package delivery
- **Sections:**
  1. Map view (full screen)
  2. Pickup location input (with map pin)
  3. Dropoff location input (with map pin)
  4. Package size selector (Small/Medium/Large)
  5. Delivery speed (Express/Same Day/Scheduled)
  6. Price estimate (dynamic)
  7. "Request Courier" button
- **Inspiration:** Lalamove + Uber interface
- **Features:**
  - Auto-detect current location
  - Address autocomplete
  - Distance calculation
  - Real-time price updates

**File: `frontend/src/screens/customer/PackageTrackingScreen.tsx` (NEW)**
- **Purpose:** Live tracking after courier accepts
- **Sections:**
  1. Live map (courier location updates every 5s)
  2. Courier info card (name, rating, photo)
  3. ETA display
  4. Status timeline (Requested → Accepted → Picked Up → Delivered)
  5. Contact buttons (Call, Chat)
- **Inspiration:** Uber tracking screen

**File: `frontend/src/screens/customer/PackageHistoryScreen.tsx` (NEW)**
- **Purpose:** View past package deliveries
- **Features:**
  - List of deliveries with status
  - Filter by date range
  - Reorder same delivery
  - Rate completed deliveries

#### **2. New Components**

**File: `frontend/src/components/CategoryCard.tsx` (NEW)**
```tsx
interface CategoryCardProps {
  title: string;
  icon: string;
  color: string;
  description: string;
  onPress: () => void;
}
```
- Large touchable card (45% screen width)
- Icon at top, title, short description
- Subtle gradient background

**File: `frontend/src/components/LocationPicker.tsx` (NEW)**
- Map-based location selector
- Search with autocomplete
- Current location button
- Recent addresses list
- Save address option

**File: `frontend/src/components/PackageSizeSelector.tsx` (NEW)**
- Three options: Small, Medium, Large
- Visual representation (box icons)
- Weight/dimension guidelines
- Price difference shown

**File: `frontend/src/components/CourierCard.tsx` (NEW)**
- Courier photo, name, rating
- Vehicle type
- Completed deliveries count
- Call/Chat buttons

**File: `frontend/src/components/LiveMap.tsx` (NEW)**
- Google Maps/Mapbox integration
- Courier marker (updates in real-time)
- Pickup marker
- Dropoff marker
- Route polyline
- ETA calculation

#### **3. Navigation Changes**

**File: `frontend/src/navigation/CustomerNavigator.tsx`**
- Add routes:
  - `FoodCategories`
  - `SendPackage`
  - `PackageTracking`
  - `PackageHistory`
  - `ServicesHome` (placeholder)
  - `GadgetsHome` (placeholder)

#### **4. Services/API Changes**

**File: `frontend/src/services/api.ts`**
- Add `packageDeliveryAPI`:
  ```typescript
  export const packageDeliveryAPI = {
    calculatePrice: (pickup: LatLng, dropoff: LatLng, size: string) => 
      api.post('/package-delivery/calculate-price', { pickup, dropoff, size }),
    
    requestDelivery: (data: PackageDeliveryRequest) => 
      api.post('/package-delivery/request', data),
    
    getDeliveryStatus: (deliveryId: string) => 
      api.get(`/package-delivery/${deliveryId}/status`),
    
    cancelDelivery: (deliveryId: string) => 
      api.post(`/package-delivery/${deliveryId}/cancel`),
    
    rateDelivery: (deliveryId: string, rating: number, feedback: string) => 
      api.post(`/package-delivery/${deliveryId}/rate`, { rating, feedback }),
    
    getHistory: (page: number, limit: number) => 
      api.get(`/package-delivery/history?page=${page}&limit=${limit}`),
  };
  ```

**File: `frontend/src/services/locationService.ts` (NEW)**
- Get current location
- Geocode address to lat/lng
- Reverse geocode lat/lng to address
- Calculate distance between points
- Get address autocomplete suggestions

#### **5. Context/State Management**

**File: `frontend/src/contexts/PackageDeliveryContext.tsx` (NEW)**
```typescript
interface PackageDeliveryContextType {
  activeDelivery: PackageDelivery | null;
  courierLocation: LatLng | null;
  updateCourierLocation: (location: LatLng) => void;
  requestDelivery: (data: PackageDeliveryRequest) => Promise<void>;
  cancelDelivery: () => Promise<void>;
}
```

---

### **BACKEND CHANGES (For Your Teammate)**

#### **1. Database Schema Changes**

**File: `backend/prisma/schema.prisma`**

```prisma
// Extend Order model
model Order {
  // ... existing fields ...
  
  orderType       OrderType  @default(food_delivery)
  
  // For package delivery
  pickupLocation  Json?      // { lat, lng, address, contactName, contactPhone }
  dropoffLocation Json?      // { lat, lng, address, contactName, contactPhone }
  packageSize     PackageSize?
  packageWeight   Float?
  packagePhoto    String?    // Photo at pickup
  deliverySpeed   DeliverySpeed?
  
  // Pricing
  basePrice       Decimal?
  distancePrice   Decimal?
  sizeMultiplier  Float?
  surgeFactor     Float?
}

enum OrderType {
  food_delivery
  package_delivery
  service_booking
  product_delivery
}

enum PackageSize {
  small
  medium
  large
}

enum DeliverySpeed {
  express      // 30-60 min
  same_day     // 2-4 hours
  scheduled    // User picks time
}

// New: Courier Location Tracking
model CourierLocation {
  id          String   @id @default(uuid())
  courierId   String
  latitude    Float
  longitude   Float
  heading     Float?   // Direction courier is facing
  speed       Float?   // km/h
  accuracy    Float?   // meters
  timestamp   DateTime @default(now())
  
  courier     User     @relation(fields: [courierId], references: [id])
  
  @@index([courierId, timestamp])
  @@map("courier_locations")
}

// New: Delivery Request Queue
model DeliveryRequest {
  id              String   @id @default(uuid())
  orderId         String   @unique
  pickupLocation  Json
  dropoffLocation Json
  packageSize     PackageSize
  estimatedPrice  Decimal
  status          RequestStatus @default(pending)
  requestedAt     DateTime @default(now())
  expiresAt       DateTime // 5 min timeout
  
  // Courier matching
  sentToCouriers  String[] // IDs of couriers who received request
  acceptedBy      String?  // Courier who accepted
  acceptedAt      DateTime?
  
  order           Order    @relation(fields: [orderId], references: [id])
  
  @@index([status, expiresAt])
  @@map("delivery_requests")
}

enum RequestStatus {
  pending
  accepted
  expired
  cancelled
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_package_delivery_support
```

#### **2. New Backend Modules**

**Module: `PackageDeliveryModule`**

**File: `backend/src/package-delivery/package-delivery.module.ts`**
```typescript
@Module({
  imports: [PrismaModule, NotificationsModule, PaymentModule],
  controllers: [PackageDeliveryController],
  providers: [PackageDeliveryService, CourierMatchingService, PricingService],
  exports: [PackageDeliveryService],
})
export class PackageDeliveryModule {}
```

#### **3. New Controllers**

**File: `backend/src/package-delivery/package-delivery.controller.ts`**

```typescript
@Controller('package-delivery')
@UseGuards(JwtAuthGuard)
export class PackageDeliveryController {
  
  @Post('calculate-price')
  async calculatePrice(@Body() dto: CalculatePriceDto) {
    // Calculate price based on distance, size, surge
  }
  
  @Post('request')
  async requestDelivery(@Request() req, @Body() dto: RequestDeliveryDto) {
    // Create delivery request
    // Find nearby couriers
    // Send push notifications to couriers
    // Return request ID
  }
  
  @Get(':id/status')
  async getDeliveryStatus(@Param('id') id: string) {
    // Return current status, courier location, ETA
  }
  
  @Post(':id/cancel')
  async cancelDelivery(@Param('id') id: string, @Request() req) {
    // Cancel delivery, notify courier, refund if paid
  }
  
  @Post(':id/rate')
  async rateDelivery(@Param('id') id: string, @Body() dto: RateDeliveryDto) {
    // Rate courier, update courier stats
  }
  
  @Get('history')
  async getHistory(@Request() req, @Query() query: PaginationDto) {
    // Return user's delivery history
  }
}
```

#### **4. New Services**

**File: `backend/src/package-delivery/package-delivery.service.ts`**

**Key Methods:**
- `calculatePrice(pickup, dropoff, size, speed)` - Dynamic pricing
- `requestDelivery(customerId, deliveryData)` - Create request
- `findNearbyCouriers(location, radius)` - Get available couriers
- `assignCourier(requestId, courierId)` - Match courier to delivery
- `updateDeliveryStatus(deliveryId, status)` - Status updates
- `getDeliveryTracking(deliveryId)` - Real-time tracking data

**File: `backend/src/package-delivery/courier-matching.service.ts`**

**Key Methods:**
- `findBestCouriers(pickupLocation, criteria)` - Smart matching
- `sendDeliveryRequest(courierId, requestData)` - Push notification
- `handleCourierAcceptance(requestId, courierId)` - Accept logic
- `handleCourierRejection(requestId, courierId)` - Rejection logic
- `handleRequestTimeout(requestId)` - Auto-cancel after 5 min

**File: `backend/src/package-delivery/pricing.service.ts`**

**Key Methods:**
- `calculateBasePrice(distance)` - Distance-based pricing
- `applySizeMultiplier(basePrice, size)` - Size adjustment
- `calculateSurgePricing(location, time)` - Surge factor
- `applyPromoCodes(price, promoCode)` - Discount logic
- `estimateETA(pickup, dropoff, traffic)` - Time estimation

#### **5. WebSocket Events**

**File: `backend/src/package-delivery/package-delivery.gateway.ts`**

```typescript
@WebSocketGateway()
export class PackageDeliveryGateway {
  
  // Courier sends location updates
  @SubscribeMessage('courier-location-update')
  handleLocationUpdate(client: Socket, data: LocationUpdateDto) {
    // Update courier location in DB
    // Broadcast to customers tracking this courier
  }
  
  // Customer requests delivery
  @SubscribeMessage('request-delivery')
  handleDeliveryRequest(client: Socket, data: DeliveryRequestDto) {
    // Create request
    // Emit to nearby couriers
  }
  
  // Courier accepts delivery
  @SubscribeMessage('accept-delivery')
  handleAcceptDelivery(client: Socket, data: AcceptDeliveryDto) {
    // Assign courier
    // Notify customer
  }
  
  // Status updates
  @SubscribeMessage('update-delivery-status')
  handleStatusUpdate(client: Socket, data: StatusUpdateDto) {
    // Update status
    // Notify customer
  }
}
```

#### **6. New DTOs**

**File: `backend/src/package-delivery/dto/calculate-price.dto.ts`**
```typescript
export class CalculatePriceDto {
  @IsObject()
  pickup: { lat: number; lng: number };
  
  @IsObject()
  dropoff: { lat: number; lng: number };
  
  @IsEnum(PackageSize)
  size: PackageSize;
  
  @IsEnum(DeliverySpeed)
  speed: DeliverySpeed;
}
```

**File: `backend/src/package-delivery/dto/request-delivery.dto.ts`**
```typescript
export class RequestDeliveryDto {
  @IsObject()
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
    contactName: string;
    contactPhone: string;
  };
  
  @IsObject()
  dropoffLocation: {
    lat: number;
    lng: number;
    address: string;
    contactName: string;
    contactPhone: string;
  };
  
  @IsEnum(PackageSize)
  packageSize: PackageSize;
  
  @IsEnum(DeliverySpeed)
  deliverySpeed: DeliverySpeed;
  
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

#### **7. Background Jobs**

**File: `backend/src/package-delivery/jobs/request-timeout.job.ts`**
- Check for delivery requests older than 5 minutes
- Auto-cancel if no courier accepted
- Notify customer
- Refund if payment was made

**File: `backend/src/package-delivery/jobs/courier-location-cleanup.job.ts`**
- Delete courier location records older than 24 hours
- Keep DB size manageable

---

## 📋 PHASE 2: SERVICES (HOME + HEALTH)

**Timeline:** 6-8 weeks  
**Priority:** MEDIUM

### **FRONTEND CHANGES**

#### **1. New Screens**

**File: `frontend/src/screens/customer/ServicesHomeScreen.tsx` (NEW)**
- Two main sections: Home Services, Health Services
- Grid layout with service categories
- Featured providers
- Recent bookings

**File: `frontend/src/screens/customer/HomeServicesScreen.tsx` (NEW)**
- Categories: Cleaning, Plumbing, Electrical, Handyman, Painting
- Provider list with ratings
- Instant booking or request quote
- Inspiration: TaskRabbit, Urban Company

**File: `frontend/src/screens/customer/HealthServicesScreen.tsx` (NEW)**
- Categories: Doctor, Lab Test, Diagnostic, Home Nurse, Physiotherapy
- Hospital/clinic list
- Doctor profiles with specializations
- Available time slots
- Inspiration: Zocdoc, Practo

**File: `frontend/src/screens/customer/ServiceProviderProfileScreen.tsx` (NEW)**
- Provider details (photo, bio, certifications)
- Services offered with pricing
- Availability calendar
- Reviews and ratings
- Portfolio/past work photos
- Book appointment button

**File: `frontend/src/screens/customer/BookServiceScreen.tsx` (NEW)**
- Service selection
- Date picker
- Time slot selector
- Address input
- Special instructions
- Price summary
- Confirm booking

**File: `frontend/src/screens/customer/ServiceBookingDetailsScreen.tsx` (NEW)**
- Booking confirmation
- Provider contact info
- Appointment details
- Reschedule/cancel options
- Chat with provider

**File: `frontend/src/screens/customer/MyBookingsScreen.tsx` (NEW)**
- Upcoming bookings
- Past bookings
- Cancelled bookings
- Filter and search

#### **2. New Components**

**File: `frontend/src/components/ServiceCategoryCard.tsx`**
- Service icon, name, starting price
- Provider count
- Tap to browse

**File: `frontend/src/components/ServiceProviderCard.tsx`**
- Provider photo, name, rating
- Service type badge
- Price range
- Availability indicator
- Quick book button

**File: `frontend/src/components/TimeSlotPicker.tsx`**
- Calendar view
- Available slots highlighted
- Booked slots disabled
- Selected slot highlighted

**File: `frontend/src/components/ServiceReviewCard.tsx`**
- Customer photo, name
- Rating stars
- Review text
- Service date
- Photos (if any)

---

### **BACKEND CHANGES (For Your Teammate)**

#### **1. Database Schema**

```prisma
model ServiceProvider {
  id              String   @id @default(uuid())
  userId          String   @unique
  businessName    String
  type            ProviderType
  category        ServiceCategory
  
  // For health providers
  specialization  String[]
  certifications  String[]
  licenseNumber   String?
  yearsExperience Int?
  
  // For all providers
  bio             String?
  serviceArea     Json     // Geographic coverage
  priceRange      Json     // { min, max, currency }
  availableSlots  Json     // Weekly schedule
  
  // Stats
  rating          Float    @default(0)
  reviewCount     Int      @default(0)
  completedJobs   Int      @default(0)
  
  // Status
  isVerified      Boolean  @default(false)
  isActive        Boolean  @default(true)
  
  user            User     @relation(fields: [userId], references: [id])
  bookings        ServiceBooking[]
  reviews         ServiceReview[]
  
  @@map("service_providers")
}

enum ProviderType {
  individual
  business
  hospital
  clinic
  lab
}

enum ServiceCategory {
  cleaning
  plumbing
  electrical
  handyman
  painting
  doctor
  lab_test
  diagnostic
  home_nurse
  physiotherapy
  telemedicine
}

model ServiceBooking {
  id                String   @id @default(uuid())
  customerId        String
  providerId        String
  serviceType       ServiceCategory
  
  appointmentDate   DateTime
  appointmentTime   String
  duration          Int      // minutes
  
  location          Json     // Where service happens
  specialInstructions String?
  
  status            BookingStatus @default(pending)
  price             Decimal
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  completedAt       DateTime?
  cancelledAt       DateTime?
  
  customer          User     @relation("CustomerBookings", fields: [customerId], references: [id])
  provider          ServiceProvider @relation(fields: [providerId], references: [id])
  review            ServiceReview?
  
  @@map("service_bookings")
}

enum BookingStatus {
  pending
  confirmed
  in_progress
  completed
  cancelled
  no_show
}

model ServiceReview {
  id          String   @id @default(uuid())
  bookingId   String   @unique
  customerId  String
  providerId  String
  rating      Int      // 1-5
  comment     String?
  photos      String[] // URLs
  createdAt   DateTime @default(now())
  
  booking     ServiceBooking @relation(fields: [bookingId], references: [id])
  customer    User     @relation("CustomerReviews", fields: [customerId], references: [id])
  provider    ServiceProvider @relation(fields: [providerId], references: [id])
  
  @@map("service_reviews")
}
```

#### **2. New Endpoints**

**Controller: `ServicesController`**

```typescript
// Browse services
GET /services/categories
GET /services/providers?category=cleaning&lat=6.5&lng=3.3&radius=10
GET /services/providers/:id

// Booking
POST /services/book
GET /services/bookings
GET /services/bookings/:id
PATCH /services/bookings/:id/reschedule
POST /services/bookings/:id/cancel
POST /services/bookings/:id/complete
POST /services/bookings/:id/review

// Provider availability
GET /services/providers/:id/availability?date=2026-03-15
```

---

## 📋 PHASE 3: GADGETS MARKETPLACE

**Timeline:** 4-6 weeks  
**Priority:** LOW

### **FRONTEND CHANGES**

#### **1. New Screens**

**File: `frontend/src/screens/customer/GadgetsHomeScreen.tsx`**
- Product categories (Phones, Laptops, Accessories, etc.)
- Featured products
- Deals and offers
- Search and filters

**File: `frontend/src/screens/customer/ProductListScreen.tsx`**
- Grid/list view toggle
- Sort options (Price, Rating, New)
- Filters (Brand, Price range, Features)
- Product cards with images, price, rating

**File: `frontend/src/screens/customer/ProductDetailsScreen.tsx`**
- Product images carousel
- Title, price, description
- Specifications
- Reviews
- Add to cart button
- Similar products

**File: `frontend/src/screens/customer/CartScreen.tsx`**
- Cart items list
- Quantity adjustment
- Remove items
- Apply promo codes
- Checkout button

---

### **BACKEND CHANGES**

```prisma
model Product {
  id          String   @id @default(uuid())
  merchantId  String
  name        String
  description String
  category    String
  brand       String?
  
  price       Decimal
  comparePrice Decimal? // Original price for discounts
  
  images      String[] // URLs
  specifications Json
  
  stock       Int      @default(0)
  sku         String?  @unique
  
  rating      Float    @default(0)
  reviewCount Int      @default(0)
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  merchant    Business @relation(fields: [merchantId], references: [id])
  
  @@map("products")
}
```

---

## 📊 Implementation Checklist

### **Phase 1: Send Package (4-6 weeks)**

**Week 1-2: Frontend Foundation**
- [ ] Restructure HomeScreen with 4-card grid
- [ ] Create FoodCategoriesScreen
- [ ] Create SendPackageScreen UI
- [ ] Create LocationPicker component
- [ ] Create PackageSizeSelector component
- [ ] Integrate Google Maps/Mapbox

**Week 3-4: Package Delivery Flow**
- [ ] Implement price calculation UI
- [ ] Create PackageTrackingScreen
- [ ] Implement live map tracking
- [ ] Create CourierCard component
- [ ] Add WebSocket for real-time updates
- [ ] Create PackageHistoryScreen

**Week 5-6: Testing & Polish**
- [ ] End-to-end testing
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Bug fixes

**Backend (Your Teammate):**
- [ ] Create PackageDeliveryModule
- [ ] Implement pricing service
- [ ] Implement courier matching service
- [ ] Create WebSocket gateway
- [ ] Add database migrations
- [ ] Create API endpoints
- [ ] Implement background jobs
- [ ] Testing

### **Phase 2: Services (6-8 weeks)**

**Frontend:**
- [ ] ServicesHomeScreen
- [ ] HomeServicesScreen
- [ ] HealthServicesScreen
- [ ] ServiceProviderProfileScreen
- [ ] BookServiceScreen
- [ ] TimeSlotPicker component
- [ ] MyBookingsScreen

**Backend:**
- [ ] ServiceProvider model
- [ ] ServiceBooking model
- [ ] ServicesController
- [ ] Booking logic
- [ ] Availability management
- [ ] Review system

### **Phase 3: Gadgets (4-6 weeks)**

**Frontend:**
- [ ] GadgetsHomeScreen
- [ ] ProductListScreen
- [ ] ProductDetailsScreen
- [ ] CartScreen
- [ ] Checkout flow

**Backend:**
- [ ] Product model
- [ ] Inventory management
- [ ] Product search
- [ ] Cart system
- [ ] Order processing

---

## 🎨 Design System Guidelines

### **Colors:**
- **Food & Essentials:** #ff6b35 (Orange)
- **Send Package:** #3498db (Blue)
- **Services:** #2ecc71 (Green)
- **Gadgets:** #9b59b6 (Purple)

### **Typography:**
- **Headings:** Bold, 20-24px
- **Body:** Regular, 14-16px
- **Captions:** 12px

### **Spacing:**
- **Small:** 8px
- **Medium:** 16px
- **Large:** 24px

### **Components:**
- **Cards:** 12px border radius, subtle shadow
- **Buttons:** 8px border radius, bold text
- **Inputs:** 8px border radius, 1px border

---

## 🚀 Getting Started

1. **Review this document** with your teammate
2. **Set up project board** (Trello/Jira) with tasks
3. **Start with Phase 1** - Send Package
4. **Frontend team** creates screens and components
5. **Backend team** implements APIs and services
6. **Weekly sync** to align progress
7. **Test together** before moving to next phase

---

**Questions? Need clarification? Let's discuss!**
