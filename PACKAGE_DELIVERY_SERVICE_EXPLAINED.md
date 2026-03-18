# 📦 Package Delivery Service - Complete Documentation

**Last Updated:** March 18, 2026  
**Platform:** Fulccrum Delivery

---

## 📋 Overview

The **Package Delivery Service** is a standalone feature that allows customers to send packages anywhere within the city, separate from food/restaurant orders. It's like **Uber for packages** - customers can send documents, gifts, electronics, or any item that needs quick delivery.

---

## 🎯 Key Features

### ✅ **What Customers Can Do:**
- Send packages from **any location to any location**
- Choose package size (Small, Medium, Large)
- Select delivery speed (Express, Same Day, Scheduled)
- Get instant price estimates
- Track package in real-time
- Add special delivery instructions
- Rate courier after delivery

### ✅ **Package Types Supported:**
- **Documents** - Contracts, certificates, legal papers
- **Electronics** - Phones, laptops, accessories
- **Gifts** - Birthday presents, flowers, etc.
- **Food items** - Home-cooked meals, groceries
- **Clothing** - Fashion items, laundry
- **General items** - Books, tools, household items

---

## 💰 Dynamic Pricing System

### **Pricing Formula:**

```typescript
totalPrice = (basePrice + (distance × perKmRate)) 
             × sizeMultiplier 
             × speedMultiplier 
             × surgeMultiplier
```

### **Default Pricing (from PlatformSettings):**

```typescript
basePackagePrice: ₦500          // Base fee for any package
perKmRate: ₦100                 // Cost per kilometer

// Size Multipliers
SMALL: 1.0   (up to 2kg)       // Documents, phones
MEDIUM: 1.5  (2-10kg)          // Laptops, gifts
LARGE: 2.0   (10-30kg)         // Appliances, bulk items

// Speed Multipliers
EXPRESS: 1.3      (< 1 hour)   // Urgent delivery
SAME_DAY: 1.0     (< 4 hours)  // Standard delivery
SCHEDULED: 0.8    (next day)   // Cheaper, planned delivery

// Surge Multipliers
PEAK_HOURS: 1.3   (12-2 PM, 6-9 PM)
WEEKEND: 1.2      (Saturday, Sunday)
BAD_WEATHER: 1.5  (Rain, storm)
HIGH_DEMAND: 1.4  (Many active orders)
```

### **Example Calculation:**

**Scenario:** Send laptop from Lekki to Victoria Island
- Distance: 12 km
- Package: MEDIUM (laptop)
- Speed: EXPRESS (urgent)
- Time: 7 PM (peak hours)

```typescript
basePrice = ₦500
distancePrice = 12 km × ₦100 = ₦1,200
sizeMultiplier = 1.5 (MEDIUM)
speedMultiplier = 1.3 (EXPRESS)
surgeMultiplier = 1.3 (PEAK_HOURS)

totalPrice = (500 + 1,200) × 1.5 × 1.3 × 1.3
           = 1,700 × 1.5 × 1.3 × 1.3
           = ₦4,318.50
```

**Customer pays:** ₦4,318.50  
**Courier earns:** ~₦3,239 (75% after platform commission)

---

## 🚀 Complete User Flow

### **Step 1: Price Estimation**

Customer opens "Send Package" screen:

```typescript
// Frontend: PriceEstimateScreen.tsx
POST /package-delivery/calculate-price
{
  pickupLocation: {
    lat: 6.4281,
    lng: 3.4219,
    address: "15 Admiralty Way, Lekki Phase 1"
  },
  dropoffLocation: {
    lat: 6.4281,
    lng: 3.4219,
    address: "Plot 1234, Victoria Island"
  },
  packageSize: "MEDIUM",
  deliverySpeed: "EXPRESS"
}

// Response:
{
  totalPrice: 4318.50,
  distance: 12.5,
  estimatedTime: 45, // minutes
  breakdown: {
    basePrice: 500,
    distancePrice: 1200,
    sizeMultiplier: 1.5,
    speedMultiplier: 1.3,
    surgeFactor: 1.3
  }
}
```

### **Step 2: Package Details**

Customer fills in package information:

```typescript
// Frontend: PackageDetailsScreen.tsx
{
  packageWeight: 3.5,              // kg
  packageDescription: "MacBook Pro 16-inch",
  recipientName: "John Doe",
  recipientPhone: "+2348012345678",
  specialInstructions: "Call before delivery, handle with care",
  packageValue: 850000,            // ₦850,000 (for insurance)
  fragile: true,
  requiresSignature: true
}
```

### **Step 3: Request Delivery**

Customer confirms and pays:

```typescript
POST /package-delivery/request
{
  pickupLocation: { ... },
  dropoffLocation: { ... },
  packageSize: "MEDIUM",
  packageWeight: 3.5,
  packageDescription: "MacBook Pro 16-inch",
  deliverySpeed: "EXPRESS",
  specialInstructions: "Call before delivery",
  recipientName: "John Doe",
  recipientPhone: "+2348012345678"
}

// Backend creates:
1. Order record (orderType: 'package_delivery')
2. DeliveryRequest record (expires in 5 minutes)
3. Finds 3 nearest couriers
4. Sends push notifications to couriers
```

### **Step 4: Courier Matching**

System finds and notifies couriers:

```typescript
// CourierMatchingService.findAndNotifyCouriers()

1. Query online couriers within 5km radius
2. Get their latest GPS locations
3. Calculate distances using Haversine formula
4. Sort by distance (nearest first)
5. Select top 3 couriers
6. Send push notifications:

   "New Delivery Request"
   "Package delivery: ₦4,318 • 12.5km"
   "MEDIUM package • EXPRESS delivery"
   
7. Set 5-minute expiration timer
```

**Courier sees:**
- Package size & weight
- Pickup & dropoff addresses
- Distance to travel
- Estimated earnings
- Countdown timer (5 minutes)

### **Step 5: Courier Accepts**

First courier to tap "Accept" gets the job:

```typescript
// WebSocket event: 'accept-delivery'
{
  requestId: "req_123",
  courierId: "courier_456"
}

// Backend:
1. Check if request still available
2. Assign courier to order
3. Update order status → 'accepted'
4. Notify customer: "Courier found! John is on the way"
5. Notify other couriers: "Request taken by another courier"
6. Start tracking courier location
```

### **Step 6: Pickup Process**

Courier navigates to pickup location:

```typescript
// Status updates:
'accepted' → Courier accepted
'heading_to_pickup' → Courier on the way
'arrived_at_pickup' → Courier at pickup location

// At pickup:
1. Courier takes photo of package
2. Verifies package details
3. Updates status → 'picked_up'
4. Photo stored in order.packagePhoto
5. Customer gets notification: "Package picked up"
```

### **Step 7: In Transit**

Real-time tracking active:

```typescript
// Courier's GPS updates every 5 seconds
WebSocket: 'courier-location-update'
{
  courierId: "courier_456",
  lat: 6.4281,
  lng: 3.4219,
  heading: 45,    // degrees
  speed: 35       // km/h
}

// Customer sees on map:
- Courier's live location (blue marker)
- Route polyline
- Estimated time of arrival
- Distance remaining
```

### **Step 8: Delivery**

Courier arrives at dropoff:

```typescript
// Status updates:
'in_transit' → Package on the way
'arrived_at_dropoff' → Courier at destination

// At delivery:
1. Courier takes delivery proof photo
2. Gets recipient signature (if required)
3. Adds delivery notes
4. Updates status → 'delivered'

POST /courier/orders/:orderId/delivery-proof
{
  photoUrl: "https://...",
  notes: "Delivered to recipient at door",
  deliveryType: "hand_to_hand",
  recipientSignature: "data:image/png;base64,..."
}
```

### **Step 9: Completion**

Order completed, payment processed:

```typescript
// Backend:
1. Mark order as 'delivered'
2. Calculate courier earnings:
   - Base pay: ₦3,239 (75% of ₦4,318)
   - Tips: ₦500 (if customer added)
   - Total: ₦3,739
3. Credit courier wallet
4. Send receipt to customer
5. Request rating

// Customer can:
- Rate courier (1-5 stars)
- Add review/feedback
- Tip courier (optional)
- Report issues
```

---

## 📱 Customer Screens

### **1. SendPackageHomeScreen**
- Entry point for package delivery
- Shows service overview
- "Send Package" button
- Recent deliveries list

### **2. PriceEstimateScreen**
- Map with pickup/dropoff pins
- Location pickers
- Package size selector (Small/Medium/Large)
- Delivery speed selector (Express/Same Day/Scheduled)
- **Live price calculation** as user changes options
- Distance & estimated time display
- "Continue" button

### **3. PackageDetailsScreen**
- Package weight input
- Package description
- Recipient name & phone
- Special instructions
- Package value (for insurance)
- Fragile checkbox
- Signature required checkbox
- "Request Delivery" button

### **4. TrackDeliveryScreen**
- Live map with courier location
- Courier details (name, photo, rating)
- Status timeline (Accepted → Pickup → Transit → Delivered)
- ETA countdown
- Call/Chat courier buttons
- Cancel delivery button (before pickup)

### **5. PackageHistoryScreen**
- List of past deliveries
- Filter by status (All/Pending/Delivered/Cancelled)
- Each item shows:
  - Package description
  - Pickup → Dropoff addresses
  - Date & time
  - Price paid
  - Courier name & rating
  - Status badge

---

## 🔧 Backend Architecture

### **Services:**

```typescript
// package-delivery/
├── package-delivery.service.ts
│   ├── calculatePrice()         // Price estimation
│   ├── requestDelivery()        // Create delivery request
│   ├── getDeliveryStatus()      // Track delivery
│   ├── cancelDelivery()         // Cancel before pickup
│   ├── rateDelivery()           // Rate courier
│   └── getHistory()             // Past deliveries
│
├── pricing.service.ts
│   ├── calculateDeliveryPrice() // Dynamic pricing
│   ├── getSurgeMultiplier()     // Peak hours, weather
│   └── getDistance()            // Google Maps API
│
├── courier-matching.service.ts
│   ├── findNearbyCouriers()     // Proximity search
│   ├── findAndNotifyCouriers()  // Broadcast to top 3
│   └── handleCourierAcceptance() // First to accept wins
│
└── package-delivery.gateway.ts (WebSocket)
    ├── courier-register         // Courier goes online
    ├── track-delivery           // Customer tracks
    ├── courier-location-update  // GPS updates
    ├── accept-delivery          // Courier accepts
    └── update-delivery-status   // Status changes
```

### **Database Models:**

```prisma
model Order {
  orderType: String              // 'package_delivery'
  orderNumber: String            // 'PKG-1710720000-ABC123'
  
  // Locations
  pickupLocation: Json           // { lat, lng, address }
  dropoffLocation: Json          // { lat, lng, address }
  
  // Package details
  packageSize: String            // SMALL, MEDIUM, LARGE
  packageWeight: Float           // in kg
  packageDescription: String
  deliverySpeed: String          // EXPRESS, SAME_DAY, SCHEDULED
  specialInstructions: String?
  
  // Pricing
  totalAmount: Float             // Final price
  basePrice: Float               // ₦500
  distancePrice: Float           // distance × ₦100
  sizeMultiplier: Float          // 1.0, 1.5, 2.0
  speedMultiplier: Float         // 0.8, 1.0, 1.3
  surgeFactor: Float             // 1.0 - 2.0
  
  // Tracking
  status: String                 // pending, accepted, picked_up, delivered
  driverId: String?              // Assigned courier
  packagePhoto: String?          // Photo at pickup
  
  // Timestamps
  acceptedAt: DateTime?
  pickedUpAt: DateTime?
  deliveredAt: DateTime?
}

model DeliveryRequest {
  orderId: String
  pickupLocation: Json
  dropoffLocation: Json
  packageSize: String
  estimatedPrice: Float
  estimatedDistance: Float
  status: String                 // pending, accepted, expired, cancelled
  sentToCouriers: String[]       // IDs of notified couriers
  acceptedBy: String?            // Courier who accepted
  acceptedAt: DateTime?
  expiresAt: DateTime            // 5 minutes from creation
}

model DeliveryProof {
  orderId: String
  photoUrl: String               // Delivery proof photo
  notes: String?                 // Courier notes
  type: String                   // hand_to_hand, contactless, left_at_door
  recipientSignature: String?    // Base64 signature image
  createdAt: DateTime
}
```

---

## 🎨 UI/UX Features

### **Price Estimation Screen:**

```typescript
// Live price updates as user changes options
const [price, setPrice] = useState(0);

useEffect(() => {
  const calculatePrice = async () => {
    const result = await packageDeliveryAPI.calculatePrice({
      pickupLocation,
      dropoffLocation,
      packageSize,
      deliverySpeed
    });
    setPrice(result.totalPrice);
  };
  
  if (pickupLocation && dropoffLocation) {
    calculatePrice();
  }
}, [pickupLocation, dropoffLocation, packageSize, deliverySpeed]);

// Display:
<View style={styles.priceCard}>
  <Text style={styles.priceLabel}>Estimated Price</Text>
  <Text style={styles.priceValue}>₦{price.toLocaleString()}</Text>
  <Text style={styles.priceDetails}>
    {distance}km • {estimatedTime} mins
  </Text>
</View>
```

### **Package Size Selector:**

```typescript
<View style={styles.sizeOptions}>
  {['SMALL', 'MEDIUM', 'LARGE'].map(size => (
    <TouchableOpacity
      key={size}
      style={[
        styles.sizeCard,
        packageSize === size && styles.sizeCardActive
      ]}
      onPress={() => setPackageSize(size)}
    >
      <Ionicons 
        name={getSizeIcon(size)} 
        size={32} 
        color={packageSize === size ? '#ef4444' : '#6b7280'} 
      />
      <Text style={styles.sizeName}>{size}</Text>
      <Text style={styles.sizeWeight}>
        {size === 'SMALL' && 'Up to 2kg'}
        {size === 'MEDIUM' && '2-10kg'}
        {size === 'LARGE' && '10-30kg'}
      </Text>
      <Text style={styles.sizeMultiplier}>
        {size === 'SMALL' && '×1.0'}
        {size === 'MEDIUM' && '×1.5'}
        {size === 'LARGE' && '×2.0'}
      </Text>
    </TouchableOpacity>
  ))}
</View>
```

### **Delivery Speed Selector:**

```typescript
<View style={styles.speedOptions}>
  <TouchableOpacity 
    style={[styles.speedCard, deliverySpeed === 'EXPRESS' && styles.active]}
    onPress={() => setDeliverySpeed('EXPRESS')}
  >
    <Ionicons name="flash" size={24} color="#ef4444" />
    <Text style={styles.speedName}>Express</Text>
    <Text style={styles.speedTime}>< 1 hour</Text>
    <Text style={styles.speedMultiplier}>+30%</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={[styles.speedCard, deliverySpeed === 'SAME_DAY' && styles.active]}
    onPress={() => setDeliverySpeed('SAME_DAY')}
  >
    <Ionicons name="time" size={24} color="#3b82f6" />
    <Text style={styles.speedName}>Same Day</Text>
    <Text style={styles.speedTime}>< 4 hours</Text>
    <Text style={styles.speedMultiplier}>Standard</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={[styles.speedCard, deliverySpeed === 'SCHEDULED' && styles.active]}
    onPress={() => setDeliverySpeed('SCHEDULED')}
  >
    <Ionicons name="calendar" size={24} color="#10b981" />
    <Text style={styles.speedName}>Scheduled</Text>
    <Text style={styles.speedTime}>Next day</Text>
    <Text style={styles.speedMultiplier}>-20%</Text>
  </TouchableOpacity>
</View>
```

---

## 🔐 Security & Safety

### **Package Verification:**
- Photo at pickup (proves condition)
- Photo at delivery (proves completion)
- Recipient signature (for high-value items)
- GPS tracking (entire journey recorded)

### **Insurance:**
- Packages up to ₦100,000 covered by default
- Optional insurance for higher values
- Claim process for lost/damaged items

### **Fraud Prevention:**
- Courier background checks
- Real-time GPS monitoring
- Photo proof requirements
- Customer ratings & reviews
- Automated fraud detection

---

## 📊 Admin Controls

### **Package Delivery Settings Screen:**

Admins can configure all pricing parameters:

```typescript
// Admin can adjust:
- Base package price (₦500)
- Per km rate (₦100)
- Size multipliers (1.0, 1.5, 2.0)
- Speed multipliers (0.8, 1.0, 1.3)
- Surge multipliers (1.2, 1.3, 1.5)
- Peak hours definition
- Weekend surge settings
- Maximum package weight
- Service availability zones
```

**Live Formula Preview:**
Shows example calculation as admin changes values

---

## 🚀 Key Advantages

### **For Customers:**
✅ **Instant pricing** - Know cost before booking  
✅ **Real-time tracking** - See courier location live  
✅ **Flexible options** - Choose speed & size  
✅ **Photo proof** - Verify pickup & delivery  
✅ **Same-day delivery** - Fast service available  
✅ **Transparent pricing** - Clear breakdown shown  

### **For Couriers:**
✅ **Good earnings** - 75% of delivery fee + tips  
✅ **Flexible work** - Accept only desired deliveries  
✅ **Clear information** - See all details before accepting  
✅ **Fair matching** - Proximity-based assignment  
✅ **Performance tracking** - Ratings & metrics  

### **For Platform:**
✅ **Automated matching** - No manual assignment needed  
✅ **Dynamic pricing** - Maximizes revenue  
✅ **Scalable** - Handles high volume  
✅ **Real-time** - WebSocket communication  
✅ **Configurable** - Admin can adjust all parameters  

---

## 📈 Use Cases

### **1. Document Delivery**
- Legal contracts
- Certificates
- Business documents
- **Size:** SMALL, **Speed:** EXPRESS

### **2. Gift Delivery**
- Birthday presents
- Flowers
- Surprise packages
- **Size:** MEDIUM, **Speed:** SAME_DAY

### **3. Electronics**
- Phones, laptops
- Accessories
- Gadgets
- **Size:** MEDIUM, **Speed:** EXPRESS

### **4. Food Sharing**
- Home-cooked meals
- Party leftovers
- Groceries
- **Size:** MEDIUM/LARGE, **Speed:** EXPRESS

### **5. Laundry/Clothing**
- Dry cleaning pickup/delivery
- Fashion items
- **Size:** MEDIUM, **Speed:** SAME_DAY

---

## 🎯 Summary

Your **Package Delivery Service** is a **complete, production-ready feature** with:

✅ **Dynamic pricing** based on distance, size, speed, and surge  
✅ **Smart courier matching** using proximity algorithm  
✅ **Real-time tracking** with GPS updates every 5 seconds  
✅ **Photo verification** at pickup and delivery  
✅ **Automated workflow** from request to completion  
✅ **Admin configurability** for all pricing parameters  
✅ **Mobile-optimized UI** with live price updates  
✅ **WebSocket communication** for instant notifications  
✅ **Comprehensive history** and tracking  

**It's essentially Uber for packages - fully functional and ready to launch!** 📦🚀

---

**Full documentation saved to:** `PACKAGE_DELIVERY_SERVICE_EXPLAINED.md`
