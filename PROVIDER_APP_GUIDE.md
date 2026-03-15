# Fulccrum Provider App - Unified Architecture

## Overview

The Fulccrum Provider App is a **unified application** that supports multiple provider types through a single codebase. Providers can register for one or multiple service categories, and the app dynamically shows relevant screens based on their selections.

---

## Supported Provider Types

### 1. 🍔 Restaurant/Food Service
- **Registration Flow**: Business info → Location → Documents → Menu
- **Dashboard**: Orders, menu management, analytics
- **Features**: Real-time orders, kitchen management, delivery tracking

### 2. 🔧 Professional Services
- **Categories**: Plumbing, Electrical, Carpentry, Painting, AC Repair, Generator Repair, etc.
- **Registration Flow**: Category selection → Details → Pricing → Portfolio
- **Dashboard**: Bookings, schedule, earnings
- **Features**: Appointment management, customer reviews, service history

### 3. 💊 Health Services
- **Categories**: Doctors, Nurses, Therapists, Physiotherapists, etc.
- **Registration Flow**: Profession → Credentials → Schedule → Specializations
- **Dashboard**: Appointments, patient records, prescriptions
- **Features**: Telemedicine, appointment scheduling, medical records

### 4. 📱 Gadgets & Electronics
- **Registration Flow**: Store setup → Product categories → Add products
- **Dashboard**: Orders, inventory, sales analytics
- **Features**: Product management, order fulfillment, stock tracking

### 5. 🏠 Home Services
- **Categories**: Cleaning, Laundry, Moving, Pest Control, etc.
- **Registration Flow**: Service type → Pricing → Service areas
- **Dashboard**: Bookings, recurring services, customer management
- **Features**: Subscription services, team management

---

## App Architecture

### Folder Structure

```
frontend/src/
├── screens/provider/
│   ├── auth/
│   │   ├── ProviderLoginScreen.tsx
│   │   ├── ProviderSignupScreen.tsx
│   │   └── ProviderTypeSelectionScreen.tsx ✅ CREATED
│   │
│   ├── registration/
│   │   ├── restaurant/
│   │   │   ├── RestaurantBasicInfoScreen.tsx ✅ CREATED
│   │   │   ├── RestaurantLocationScreen.tsx (TODO)
│   │   │   ├── RestaurantDocumentsScreen.tsx (TODO)
│   │   │   └── RestaurantMenuScreen.tsx (TODO)
│   │   │
│   │   ├── service/
│   │   │   ├── ServiceCategoryScreen.tsx ✅ CREATED
│   │   │   ├── ServiceDetailsScreen.tsx (TODO)
│   │   │   └── ServicePricingScreen.tsx (TODO)
│   │   │
│   │   ├── health/
│   │   │   ├── HealthProfessionScreen.tsx (TODO)
│   │   │   ├── HealthCredentialsScreen.tsx (TODO)
│   │   │   └── HealthScheduleScreen.tsx (TODO)
│   │   │
│   │   ├── seller/
│   │   │   ├── StoreSetupScreen.tsx ✅ CREATED
│   │   │   ├── ProductCategoriesScreen.tsx (TODO)
│   │   │   └── AddProductsScreen.tsx (TODO)
│   │   │
│   │   └── home-service/
│   │       ├── HomeServiceTypeScreen.tsx (TODO)
│   │       ├── HomeServicePricingScreen.tsx (TODO)
│   │       └── HomeServiceAreasScreen.tsx (TODO)
│   │
│   ├── dashboard/
│   │   ├── RestaurantDashboardScreen.tsx (TODO)
│   │   ├── ServiceDashboardScreen.tsx (TODO)
│   │   ├── HealthDashboardScreen.tsx (TODO)
│   │   ├── SellerDashboardScreen.tsx (TODO)
│   │   ├── HomeServiceDashboardScreen.tsx (TODO)
│   │   └── MultiRoleSwitcherScreen.tsx (TODO)
│   │
│   ├── orders/
│   │   ├── RestaurantOrdersScreen.tsx (TODO)
│   │   ├── ServiceBookingsScreen.tsx (TODO)
│   │   └── SellerOrdersScreen.tsx (TODO)
│   │
│   └── shared/
│       ├── WalletScreen.tsx (TODO)
│       ├── AnalyticsScreen.tsx (TODO)
│       ├── ProfileScreen.tsx (TODO)
│       └── SettingsScreen.tsx (TODO)
│
└── navigation/
    └── ProviderNavigator.tsx ✅ CREATED
```

---

## User Flow

### 1. Registration Flow

```
User opens Provider App
    ↓
Login/Signup
    ↓
ProviderTypeSelectionScreen
"What do you provide?"
    ↓
User selects one or more:
  ☑ Restaurant
  ☑ Professional Services
  ☐ Health Services
  ☑ Gadget Seller
  ☐ Home Services
    ↓
[Continue with 3 services]
    ↓
Navigate to first selected type's registration
    ↓
Complete registration for Restaurant
    ↓
Complete registration for Professional Services
    ↓
Complete registration for Gadget Seller
    ↓
Submit for admin approval
    ↓
Dashboard (with role switcher if multiple roles)
```

### 2. Multi-Role Dashboard

If user has multiple provider types:

```
┌─────────────────────────────────────┐
│  Switch View:                       │
│  [Restaurant 🍔] [Plumber 🔧] [Store 📱] │
└─────────────────────────────────────┘

Currently viewing: Restaurant

Today's Orders: 23
Revenue: ₦45,000
Active Orders: 5

[New Orders] [Menu] [Analytics]
```

Tap to switch between roles, each showing its own dashboard.

---

## Database Schema

### User Model (Multi-Role Support)

```typescript
interface ProviderUser {
  id: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  
  // Can have multiple provider types
  providerTypes: ProviderType[];
  
  // Role-specific profiles
  restaurantProfile?: RestaurantProfile;
  serviceProfile?: ServiceProviderProfile;
  healthProfile?: HealthServiceProfile;
  sellerProfile?: SellerProfile;
  homeServiceProfile?: HomeServiceProfile;
  
  // Shared across all roles
  walletBalance: number;
  overallRating: number;
  isApproved: boolean;
  createdAt: Date;
}

enum ProviderType {
  RESTAURANT = 'RESTAURANT',
  PROFESSIONAL_SERVICE = 'PROFESSIONAL_SERVICE',
  HEALTH_SERVICE = 'HEALTH_SERVICE',
  GADGET_SELLER = 'GADGET_SELLER',
  HOME_SERVICE = 'HOME_SERVICE',
}
```

### Restaurant Profile

```typescript
interface RestaurantProfile {
  id: string;
  userId: string;
  
  businessName: string;
  restaurantType: string;
  cuisineTypes: string[];
  description: string;
  
  address: string;
  location: { lat: number; lng: number };
  deliveryRadius: number;
  operatingHours: OperatingHours;
  
  foodLicense: string;
  businessRegNumber: string;
  kitchenPhotos: string[];
  
  rating: number;
  totalOrders: number;
  isActive: boolean;
  isApproved: boolean;
}
```

### Service Provider Profile

```typescript
interface ServiceProviderProfile {
  id: string;
  userId: string;
  
  category: ServiceCategory;
  businessName: string;
  yearsOfExperience: number;
  serviceAreas: string[];
  
  certifications: string[];
  portfolioPhotos: string[];
  
  pricingModel: 'HOURLY' | 'FIXED';
  hourlyRate?: number;
  fixedRates?: { [key: string]: number };
  
  rating: number;
  totalJobs: number;
  isAvailable: boolean;
  isApproved: boolean;
}

enum ServiceCategory {
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  CARPENTRY = 'CARPENTRY',
  PAINTING = 'PAINTING',
  AC_REPAIR = 'AC_REPAIR',
  GENERATOR = 'GENERATOR',
  // ... etc
}
```

### Seller Profile

```typescript
interface SellerProfile {
  id: string;
  userId: string;
  
  storeName: string;
  storeDescription: string;
  storeLogo: string;
  businessRegNumber?: string;
  
  productCategories: string[];
  
  rating: number;
  totalSales: number;
  isApproved: boolean;
  
  products: Product[];
}

interface Product {
  id: string;
  sellerId: string;
  
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  stock: number;
  
  isActive: boolean;
}
```

---

## Navigation Logic

```typescript
function ProviderNavigator() {
  const { user } = useAuth();
  
  // Not registered yet
  if (!user.providerTypes || user.providerTypes.length === 0) {
    return <ProviderRegistrationFlow />;
  }
  
  // Pending approval
  if (!user.isApproved) {
    return <PendingApprovalScreen />;
  }
  
  // Multiple roles
  if (user.providerTypes.length > 1) {
    return <MultiRoleDashboard />;
  }
  
  // Single role - show specific dashboard
  switch (user.providerTypes[0]) {
    case 'RESTAURANT':
      return <RestaurantDashboard />;
    case 'PROFESSIONAL_SERVICE':
      return <ServiceProviderDashboard />;
    case 'HEALTH_SERVICE':
      return <HealthProviderDashboard />;
    case 'GADGET_SELLER':
      return <SellerDashboard />;
    case 'HOME_SERVICE':
      return <HomeServiceDashboard />;
  }
}
```

---

## Integration with Customer App

### Order Flow

```
Customer places order (food/package/service/gadget)
    ↓
Backend creates order with type
    ↓
Notification sent to relevant providers:
  - FOOD_ORDER → Restaurants
  - PACKAGE_DELIVERY → Couriers
  - SERVICE_BOOKING → Service Providers
  - GADGET_ORDER → Sellers
    ↓
Provider accepts/declines
    ↓
If delivery needed → Courier assigned
    ↓
Order fulfilled
    ↓
Payment released (provider + courier + platform)
```

---

## Commission Structure

```typescript
// Restaurant Order
Total: ₦5,000
├── Restaurant: ₦4,000 (80%)
├── Courier: ₦750 (15%)
└── Platform: ₦250 (5%)

// Service Booking
Total: ₦10,000
├── Service Provider: ₦8,500 (85%)
└── Platform: ₦1,500 (15%)

// Gadget Order
Total: ₦50,000
├── Seller: ₦47,500 (95%)
├── Courier: ₦1,500 (3%)
└── Platform: ₦1,000 (2%)
```

---

## Next Steps

### Immediate (Phase 1)
1. ✅ Create ProviderTypeSelectionScreen
2. ✅ Create Restaurant registration flow (basic info)
3. ✅ Create Service Provider registration flow (category)
4. ✅ Create Seller registration flow (store setup)
5. ✅ Create ProviderNavigator

### Short-term (Phase 2)
6. Complete all registration flows for each provider type
7. Create role-based dashboards
8. Implement multi-role switcher
9. Build order management screens
10. Add wallet and analytics

### Medium-term (Phase 3)
11. Backend API integration
12. Real-time notifications
13. Payment processing
14. Admin approval workflow
15. Testing and QA

---

## Key Features

### ✅ Implemented
- Provider type selection screen
- Multi-role support architecture
- Restaurant basic info registration
- Service category selection
- Seller store setup
- Unified navigation structure

### 🚧 In Progress
- Complete registration flows
- Role-based dashboards
- Order management

### 📋 Planned
- Multi-role dashboard switcher
- Shared wallet system
- Analytics and reporting
- Real-time order notifications
- Payment integration

---

## Benefits of Unified App

1. **Single Codebase** - Easier maintenance and updates
2. **Shared Components** - Reuse UI components across provider types
3. **Multi-Role Support** - Users can be multiple provider types
4. **Consistent UX** - Same design language throughout
5. **Scalable** - Easy to add new provider types
6. **Cost-Effective** - One app instead of 5 separate apps
7. **Unified Wallet** - Single balance across all roles
8. **Cross-Selling** - Encourage users to add more services

---

## Testing

To test the Provider App:

1. Navigate to ProviderTypeSelection screen
2. Select one or more provider types
3. Complete registration flow
4. Verify data is saved correctly
5. Test multi-role switching (if applicable)
6. Test order acceptance/fulfillment
7. Verify payment calculations

---

## Support

For questions or issues, contact the development team.

**Last Updated**: March 14, 2026
