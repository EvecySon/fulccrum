# Provider System - Backend Requirements

## Overview
This document outlines the complete backend requirements for the unified Provider system that supports Restaurants, Professional Services, Health Services, Gadget Sellers, and Home Services.

---

## 1. Database Models (Prisma Schema)

### User Model (Extended)
```prisma
model User {
  id                String      @id @default(uuid())
  email             String      @unique
  phoneNumber       String      @unique
  firstName         String
  lastName          String
  password          String
  
  // Role management
  role              UserRole    @default(CUSTOMER)
  providerTypes     ProviderType[]
  
  // Profile
  avatarUrl         String?
  dateOfBirth       DateTime?
  gender            String?
  
  // Wallet
  walletBalance     Float       @default(0)
  
  // Status
  isEmailVerified   Boolean     @default(false)
  isPhoneVerified   Boolean     @default(false)
  isApproved        Boolean     @default(false)
  isActive          Boolean     @default(true)
  
  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Relations
  restaurantProfile         RestaurantProfile?
  serviceProviderProfile    ServiceProviderProfile?
  healthServiceProfile      HealthServiceProfile?
  sellerProfile             SellerProfile?
  homeServiceProfile        HomeServiceProfile?
  
  customerOrders    Order[]     @relation("CustomerOrders")
  providerOrders    Order[]     @relation("ProviderOrders")
  courierOrders     Order[]     @relation("CourierOrders")
  
  transactions      Transaction[]
  reviews           Review[]
}

enum UserRole {
  CUSTOMER
  PROVIDER
  COURIER
  ADMIN
}

enum ProviderType {
  RESTAURANT
  PROFESSIONAL_SERVICE
  HEALTH_SERVICE
  GADGET_SELLER
  HOME_SERVICE
}
```

### RestaurantProfile Model
```prisma
model RestaurantProfile {
  id                String      @id @default(uuid())
  userId            String      @unique
  user              User        @relation(fields: [userId], references: [id])
  
  // Basic Info
  businessName      String
  restaurantType    String      // Fast Food, Fine Dining, etc.
  cuisineTypes      String[]
  description       String?
  
  // Contact
  businessEmail     String
  businessPhone     String
  
  // Location
  address           String
  city              String
  state             String
  latitude          Float?
  longitude         Float?
  deliveryRadius    Float       // in km
  
  // Operating Hours
  operatingHours    Json        // { mon: { open: "09:00", close: "22:00" }, ... }
  
  // Documents
  foodLicense       String?
  businessRegNumber String?
  kitchenPhotos     String[]
  
  // Status & Metrics
  isApproved        Boolean     @default(false)
  isActive          Boolean     @default(true)
  rating            Float       @default(0)
  totalOrders       Int         @default(0)
  totalRevenue      Float       @default(0)
  
  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Relations
  menuItems         MenuItem[]
}

model MenuItem {
  id                String      @id @default(uuid())
  restaurantId      String
  restaurant        RestaurantProfile @relation(fields: [restaurantId], references: [id])
  
  name              String
  description       String?
  category          String
  price             Float
  images            String[]
  
  isAvailable       Boolean     @default(true)
  preparationTime   Int?        // in minutes
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}
```

### ServiceProviderProfile Model
```prisma
model ServiceProviderProfile {
  id                String      @id @default(uuid())
  userId            String      @unique
  user              User        @relation(fields: [userId], references: [id])
  
  // Basic Info
  businessName      String
  category          ServiceCategory
  subCategories     String[]
  yearsOfExperience Int
  description       String?
  
  // Service Areas
  serviceAreas      String[]    // Array of zone/area names
  serviceRadius     Float?      // in km
  
  // Certifications
  certifications    String[]    // URLs to certificate images
  portfolioPhotos   String[]
  
  // Pricing
  pricingModel      PricingModel
  hourlyRate        Float?
  fixedRates        Json?       // { "basic_plumbing": 5000, "advanced": 15000 }
  
  // Availability
  isAvailable       Boolean     @default(true)
  workingHours      Json?       // Similar to restaurant hours
  
  // Status & Metrics
  isApproved        Boolean     @default(false)
  isActive          Boolean     @default(true)
  rating            Float       @default(0)
  totalJobs         Int         @default(0)
  totalRevenue      Float       @default(0)
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

enum ServiceCategory {
  PLUMBING
  ELECTRICAL
  CARPENTRY
  PAINTING
  AC_REPAIR
  GENERATOR_REPAIR
  APPLIANCE_REPAIR
  ROOFING
  WELDING
  TILING
  GARDENING
  OTHER
}

enum PricingModel {
  HOURLY
  FIXED
  BOTH
}
```

### HealthServiceProfile Model
```prisma
model HealthServiceProfile {
  id                String      @id @default(uuid())
  userId            String      @unique
  user              User        @relation(fields: [userId], references: [id])
  
  // Professional Info
  profession        HealthProfession
  specializations   String[]
  licenseNumber     String
  yearsOfExperience Int
  
  // Credentials
  medicalDegree     String      // URL to certificate
  licenseDocument   String      // URL to license
  additionalCerts   String[]
  
  // Practice Info
  clinicName        String?
  clinicAddress     String?
  consultationFee   Float
  homeVisitFee      Float?
  
  // Availability
  availableForHomeVisit Boolean  @default(false)
  availableForTelemedicine Boolean @default(false)
  workingHours      Json
  
  // Status & Metrics
  isApproved        Boolean     @default(false)
  isActive          Boolean     @default(true)
  rating            Float       @default(0)
  totalConsultations Int        @default(0)
  totalRevenue      Float       @default(0)
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

enum HealthProfession {
  DOCTOR
  NURSE
  PHYSIOTHERAPIST
  THERAPIST
  NUTRITIONIST
  PHARMACIST
  DENTIST
  OPTOMETRIST
  OTHER
}
```

### SellerProfile Model
```prisma
model SellerProfile {
  id                String      @id @default(uuid())
  userId            String      @unique
  user              User        @relation(fields: [userId], references: [id])
  
  // Store Info
  storeName         String
  storeDescription  String?
  storeLogo         String?
  businessRegNumber String?
  
  // Categories
  productCategories String[]
  
  // Bank Details (for payouts)
  bankName          String?
  accountNumber     String?
  accountName       String?
  
  // Status & Metrics
  isApproved        Boolean     @default(false)
  isActive          Boolean     @default(true)
  rating            Float       @default(0)
  totalSales        Int         @default(0)
  totalRevenue      Float       @default(0)
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  // Relations
  products          Product[]
}

model Product {
  id                String      @id @default(uuid())
  sellerId          String
  seller            SellerProfile @relation(fields: [sellerId], references: [id])
  
  name              String
  description       String
  category          String
  price             Float
  compareAtPrice    Float?      // Original price for discounts
  images            String[]
  
  // Inventory
  stock             Int
  sku               String?
  
  // Specifications
  specifications    Json?       // { "brand": "Samsung", "color": "Black", ... }
  
  // Status
  isActive          Boolean     @default(true)
  isFeatured        Boolean     @default(false)
  
  // Metrics
  viewCount         Int         @default(0)
  salesCount        Int         @default(0)
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}
```

### HomeServiceProfile Model
```prisma
model HomeServiceProfile {
  id                String      @id @default(uuid())
  userId            String      @unique
  user              User        @relation(fields: [userId], references: [id])
  
  // Service Info
  businessName      String
  serviceType       HomeServiceType
  description       String?
  
  // Service Areas
  serviceAreas      String[]
  serviceRadius     Float?
  
  // Pricing
  pricingModel      PricingModel
  hourlyRate        Float?
  fixedRates        Json?
  
  // Team
  teamSize          Int?
  hasInsurance      Boolean     @default(false)
  
  // Availability
  isAvailable       Boolean     @default(true)
  workingHours      Json
  
  // Status & Metrics
  isApproved        Boolean     @default(false)
  isActive          Boolean     @default(true)
  rating            Float       @default(0)
  totalJobs         Int         @default(0)
  totalRevenue      Float       @default(0)
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

enum HomeServiceType {
  CLEANING
  LAUNDRY
  MOVING
  PEST_CONTROL
  FUMIGATION
  SECURITY
  CATERING
  EVENT_PLANNING
  OTHER
}
```

### Unified Order Model
```prisma
model Order {
  id                String      @id @default(uuid())
  orderNumber       String      @unique
  orderType         OrderType
  
  // Parties
  customerId        String
  customer          User        @relation("CustomerOrders", fields: [customerId], references: [id])
  providerId        String?
  provider          User?       @relation("ProviderOrders", fields: [providerId], references: [id])
  courierId         String?
  courier           User?       @relation("CourierOrders", fields: [courierId], references: [id])
  
  // Status
  status            OrderStatus @default(PENDING)
  
  // Pricing
  subtotal          Float
  deliveryFee       Float       @default(0)
  serviceFee        Float
  totalAmount       Float
  
  // Commission Split
  providerEarnings  Float
  courierEarnings   Float       @default(0)
  platformFee       Float
  
  // Type-specific data (JSON)
  foodOrderData     Json?       // Restaurant order details
  packageData       Json?       // Package delivery details
  serviceBookingData Json?      // Service booking details
  gadgetOrderData   Json?       // Gadget order details
  homeServiceData   Json?       // Home service details
  
  // Timestamps
  createdAt         DateTime    @default(now())
  acceptedAt        DateTime?
  completedAt       DateTime?
  cancelledAt       DateTime?
  
  // Relations
  payments          Payment[]
  reviews           Review[]
}

enum OrderType {
  FOOD_DELIVERY
  PACKAGE_DELIVERY
  SERVICE_BOOKING
  GADGET_ORDER
  HOME_SERVICE
  GROCERY_DELIVERY
  PHARMACY_DELIVERY
}

enum OrderStatus {
  PENDING
  SEARCHING
  ACCEPTED
  PREPARING
  READY
  PICKED_UP
  IN_TRANSIT
  DELIVERED
  COMPLETED
  CANCELLED
  REFUNDED
}
```

### Transaction Model
```prisma
model Transaction {
  id                String      @id @default(uuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  
  type              TransactionType
  amount            Float
  balanceBefore     Float
  balanceAfter      Float
  
  // Reference
  orderId           String?
  reference         String      @unique
  
  // Payment Gateway
  paymentMethod     String?
  paymentReference  String?
  
  status            TransactionStatus @default(PENDING)
  description       String?
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

enum TransactionType {
  ORDER_PAYMENT
  PROVIDER_EARNING
  COURIER_EARNING
  WITHDRAWAL
  REFUND
  WALLET_TOPUP
  COMMISSION
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REVERSED
}
```

### Review Model
```prisma
model Review {
  id                String      @id @default(uuid())
  orderId           String
  order             Order       @relation(fields: [orderId], references: [id])
  
  reviewerId        String
  reviewer          User        @relation(fields: [reviewerId], references: [id])
  
  revieweeId        String      // Provider or Courier being reviewed
  revieweeType      String      // "PROVIDER" or "COURIER"
  
  rating            Int         // 1-5
  comment           String?
  tags              String[]    // ["Fast", "Professional", "Clean"]
  
  createdAt         DateTime    @default(now())
  
  @@unique([orderId, reviewerId, revieweeType])
}
```

---

## 2. API Endpoints

### Provider Registration

#### POST /api/provider/register
Register a new provider with selected provider types.

**Request:**
```json
{
  "userId": "user-uuid",
  "providerTypes": ["RESTAURANT", "GADGET_SELLER"],
  "restaurantData": {
    "businessName": "Mama's Kitchen",
    "restaurantType": "Fast Food",
    "cuisineTypes": ["Nigerian", "Continental"],
    "address": "123 Main St, Lagos",
    "operatingHours": {...},
    "foodLicense": "license-url",
    "businessRegNumber": "RC123456"
  },
  "sellerData": {
    "storeName": "Tech Hub",
    "storeDescription": "Electronics store",
    "productCategories": ["Phones", "Laptops"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Provider registration submitted for approval",
  "data": {
    "userId": "user-uuid",
    "providerTypes": ["RESTAURANT", "GADGET_SELLER"],
    "status": "PENDING_APPROVAL"
  }
}
```

#### GET /api/provider/profile/:userId
Get provider profile with all provider types.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-uuid",
    "providerTypes": ["RESTAURANT"],
    "restaurantProfile": {
      "id": "profile-uuid",
      "businessName": "Mama's Kitchen",
      "isApproved": true,
      "rating": 4.8,
      "totalOrders": 156
    }
  }
}
```

### Order Management

#### POST /api/orders/create
Create a new order (any type).

**Request:**
```json
{
  "customerId": "user-uuid",
  "orderType": "FOOD_DELIVERY",
  "providerId": "restaurant-uuid",
  "items": [...],
  "deliveryAddress": {...},
  "totalAmount": 5000
}
```

#### GET /api/orders/provider/:providerId
Get all orders for a provider.

**Query Params:**
- `status`: Filter by status
- `orderType`: Filter by order type
- `page`: Pagination
- `limit`: Items per page

#### PATCH /api/orders/:orderId/status
Update order status.

**Request:**
```json
{
  "status": "ACCEPTED",
  "estimatedTime": 30
}
```

### Courier Assignment

#### POST /api/courier/assign
Assign courier to order (automatic matching).

**Request:**
```json
{
  "orderId": "order-uuid",
  "pickupLocation": { "lat": 6.5244, "lng": 3.3792 },
  "dropoffLocation": { "lat": 6.4474, "lng": 3.4700 }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courierId": "courier-uuid",
    "courier": {
      "name": "John Doe",
      "phone": "+234...",
      "rating": 4.9
    },
    "eta": 15
  }
}
```

### Admin Approval

#### GET /api/admin/providers/pending
Get all pending provider approvals.

#### POST /api/admin/providers/:providerId/approve
Approve a provider.

**Request:**
```json
{
  "providerType": "RESTAURANT",
  "approved": true,
  "notes": "All documents verified"
}
```

### Payment & Wallet

#### POST /api/wallet/topup
Top up wallet balance.

#### POST /api/wallet/withdraw
Withdraw from wallet.

#### GET /api/wallet/transactions
Get transaction history.

---

## 3. Commission Structure

```typescript
// Restaurant Order
const calculateRestaurantCommission = (totalAmount: number) => {
  return {
    restaurantEarnings: totalAmount * 0.80,  // 80%
    courierEarnings: totalAmount * 0.15,     // 15%
    platformFee: totalAmount * 0.05,         // 5%
  };
};

// Package Delivery
const calculatePackageCommission = (totalAmount: number) => {
  return {
    courierEarnings: totalAmount * 0.80,     // 80%
    platformFee: totalAmount * 0.20,         // 20%
  };
};

// Service Booking
const calculateServiceCommission = (totalAmount: number) => {
  return {
    providerEarnings: totalAmount * 0.85,    // 85%
    platformFee: totalAmount * 0.15,         // 15%
  };
};

// Gadget Order
const calculateGadgetCommission = (totalAmount: number) => {
  return {
    sellerEarnings: totalAmount * 0.95,      // 95%
    courierEarnings: totalAmount * 0.03,     // 3%
    platformFee: totalAmount * 0.02,         // 2%
  };
};
```

---

## 4. Real-time Features

### WebSocket Events

**Provider Events:**
- `new_order` - New order received
- `order_accepted` - Order accepted by customer
- `order_cancelled` - Order cancelled
- `courier_assigned` - Courier assigned to order

**Courier Events:**
- `delivery_request` - New delivery request (30s to accept)
- `delivery_cancelled` - Delivery cancelled
- `customer_message` - Message from customer

**Customer Events:**
- `provider_accepted` - Provider accepted order
- `courier_found` - Courier assigned
- `courier_location` - Live courier location updates
- `order_status_changed` - Order status updated

---

## 5. Notification System

### Push Notifications

**Provider Notifications:**
- New order received
- Order payment confirmed
- Customer cancelled order
- New review received
- Payout processed

**Courier Notifications:**
- New delivery request
- Delivery cancelled
- Customer location updated
- Earnings milestone reached

**Customer Notifications:**
- Order accepted
- Courier assigned
- Courier nearby
- Order delivered
- Refund processed

---

## 6. Admin Features

### Provider Management
- Approve/reject provider registrations
- Suspend/activate providers
- View provider analytics
- Manage provider disputes

### Order Management
- View all orders across all types
- Manually assign/reassign couriers
- Process refunds
- Handle customer complaints

### Financial Management
- Process provider payouts
- View commission reports
- Export financial data
- Tax reporting

---

## 7. Security & Validation

### Authentication
- JWT tokens for API authentication
- Role-based access control (RBAC)
- Provider type verification

### Data Validation
- Input sanitization
- File upload validation (size, type)
- Document verification
- Address validation

### Payment Security
- PCI compliance
- Encrypted payment data
- Secure webhook handling
- Fraud detection

---

## Implementation Priority

### Phase 1 (Immediate)
1. User model extension with provider types
2. Restaurant profile & registration
3. Service provider profile & registration
4. Basic order creation & management
5. Provider approval workflow

### Phase 2 (Short-term)
6. Seller profile & product management
7. Health service profile
8. Home service profile
9. Unified order system
10. Commission calculation

### Phase 3 (Medium-term)
11. Real-time courier assignment
12. WebSocket implementation
13. Payment integration
14. Wallet system
15. Review system

### Phase 4 (Long-term)
16. Admin dashboard APIs
17. Analytics & reporting
18. Advanced features (subscriptions, loyalty, etc.)

---

**Last Updated**: March 14, 2026
