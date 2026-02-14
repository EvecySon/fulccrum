# Backend Endpoints Required by Frontend

> **Updated: Feb 14, 2026**
> This document lists every backend API endpoint the frontend expects. Endpoints marked ✅ already exist in the backend. Endpoints marked 🔧 have stub implementations (need real logic). Endpoints marked ❌ are completely new and need to be built from scratch.
>
> **Recent changes (Feb 13-14):** Scheduling system fully implemented (Glovo parity), admin Schedule Management screen built, courier booking flow working end-to-end, DB schema migrated with `ScheduleSlot`, `ScheduleZone`, `ScheduleNoShow` models.
> **Customer App Sprint (Feb 14):** 30 features implemented (8 P0, 11 P1, 11 P2). New Section 10 added with 6 new/enhanced backend endpoints needed. New screens: DealsScreen, OnboardingScreen. New components: SkeletonLoader, haptics utility. Enhanced: CartScreen (pickup, scheduling, delivery instructions, address picker, map preview), OrderTrackingScreen (cancel, ETA countdown, tip, receipt, animated status), HomeScreen (open/closed, price range, pull-to-refresh), SearchScreen (sort, dietary filters, free delivery), RestaurantScreen (info panel, popular items, quick add, share).

---

## 1. Merchant Application Review & Document Verification

These endpoints power the **Merchant Applications** screen where admins review merchant applications, verify documents, approve/reject merchants.

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/admin/merchants/pending?page=1&limit=50` | ✅ Exists | List pending merchant applications with business profile + user info |
| `PATCH` | `/admin/merchants/:merchantId/approve` | ✅ Exists | Approve a merchant (sets `verificationStatus: 'verified'`) |
| `PATCH` | `/admin/merchants/:merchantId/reject` | ✅ Exists | Reject a merchant (sets `verificationStatus: 'rejected'`). Body: `{ reason?: string }` |
| `GET` | `/admin/merchants/:merchantId/application` | 🔧 Stub | Get full merchant application details (business info, owner info, documents, compliance status) |
| `GET` | `/admin/merchants/:merchantId/documents` | 🔧 Stub | List all uploaded documents for a merchant. **Needs a `Document` model in Prisma.** |
| `PATCH` | `/admin/merchants/:merchantId/documents/:docId/verify` | 🔧 Stub | Mark a specific document as verified |
| `PATCH` | `/admin/merchants/:merchantId/documents/:docId/reject` | 🔧 Stub | Reject a specific document. Body: `{ reason: string }` |
| `POST` | `/admin/merchants/:merchantId/request-documents` | 🔧 Stub | Send email/notification requesting missing documents. Body: `{ documentTypes: string[] }` |
| `POST` | `/admin/invite/merchant` | ✅ Exists | Admin-initiated merchant invitation. Body: `{ email, businessName, ownerName, phone?, commission? }` |

### Required: New Prisma Model — `Document`

```prisma
model Document {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // 'business_license', 'health_permit', 'owner_id', 'insurance', 'tax_certificate', 'drivers_license', 'vehicle_registration', 'guarantor_form'
  name        String   // Display name e.g. "CAC Registration Certificate"
  fileUrl     String   // S3/Cloudinary URL
  status      String   @default("uploaded") // 'uploaded', 'verified', 'rejected', 'expired', 'missing'
  rejectionReason String?
  verifiedBy  String?
  verifiedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 2. Courier Management & Document Verification

These endpoints power the **Courier Management** screen where admins list couriers, review applications, verify documents, approve/reject/suspend/reactivate.

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/admin/couriers?page=1&limit=50` | 🔧 Stub | List all couriers with driver profile. Returns `{ data, meta }` |
| `GET` | `/admin/couriers/pending?page=1&limit=50` | 🔧 Stub | List pending courier applications (status = 'inactive'). Returns `{ data, meta }` |
| `PATCH` | `/admin/couriers/:id/approve` | ✅ Exists | Approve a courier. Body: `{ approved: true, notes?: string }` |
| `PATCH` | `/admin/couriers/:id/reject` | ✅ Exists | Reject a courier. Body: `{ reason: string }` |
| `PATCH` | `/admin/couriers/:id/suspend` | ✅ Exists | Suspend an active courier. Body: `{ reason?: string }` |
| `PATCH` | `/admin/couriers/:id/reactivate` | ✅ Exists | Reactivate a suspended courier |
| `GET` | `/admin/couriers/:id/documents` | 🔧 Stub | List all uploaded documents for a courier. **Uses same `Document` model above.** |
| `PATCH` | `/admin/couriers/:id/documents/:docId/verify` | 🔧 Stub | Mark a courier document as verified |
| `POST` | `/admin/invite/courier` | ✅ Exists | Admin-initiated courier invitation. Body: `{ email, firstName, lastName }` |

### Expected Courier Document Types
- `drivers_license` — Driver's License
- `vehicle_registration` — Vehicle Registration
- `insurance` — Vehicle Insurance
- `national_id` — National ID (NIN) / Passport / Voter's Card
- `guarantor_form` — Guarantor Form (signed)

---

## 3. Content Reporting (Customer-Facing)

These endpoints power the **Report/Flag** button on RestaurantScreen and MenuItemScreen. When a customer flags content, it feeds into the admin Content Moderation queue.

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `POST` | `/report/content` | ✅ NEW | Customer reports content. Creates entry in `ContentModerationQueue`. Body below. |
| `GET` | `/report/my-reports` | ✅ NEW | Customer views their own submitted reports |

### `POST /report/content` — Request Body
```json
{
  "type": "menu_item" | "review" | "business_profile",
  "resourceId": "uuid-of-the-item",
  "reason": "inappropriate" | "misleading" | "spam" | "offensive" | "health_safety" | "fraud" | "other",
  "details": "Optional additional details from the user"
}
```

### `POST /report/content` — Response
```json
{
  "message": "Report submitted successfully",
  "id": "uuid-of-moderation-queue-entry"
}
```

> **Backend module already created:** `src/report/report.module.ts`, `report.service.ts`, `report.controller.ts`. Registered in `app.module.ts`. The service writes to the existing `ContentModerationQueue` table.

---

## 4. Content Moderation (Admin-Facing) — Already Exists

These endpoints already exist and power the **Content Moderation** screen.

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/admin/moderation/queue?type=&status=&page=1&limit=50` | ✅ Exists | List moderation queue items |
| `PATCH` | `/admin/moderation/:id/approve` | ✅ Exists | Approve content |
| `PATCH` | `/admin/moderation/:id/reject` | ✅ Exists | Reject content. Body: `{ reason: string }` |
| `GET` | `/admin/moderation/stats?startDate=&endDate=` | ✅ Exists | Moderation statistics |

---

## 5. Merchant Compliance — Already Exists

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/admin/moderation/compliance?status=&page=1&limit=50` | ✅ Exists | List all compliance records |
| `GET` | `/admin/moderation/compliance/:businessId` | ✅ Exists | Get compliance for a specific merchant |
| `PATCH` | `/admin/moderation/compliance/:businessId` | ✅ Exists | Update compliance data |
| `GET` | `/admin/moderation/compliance/stats` | ✅ Exists | Compliance statistics |

---

## 6. Document Upload (Merchant & Courier Onboarding)

These endpoints are needed for merchants and couriers to **upload their documents** during the onboarding flow. The admin screens expect documents to already be uploaded.

The frontend has a **shared config** at `frontend/src/config/documentRequirements.ts` that defines all document types. The backend must accept these exact `type` keys.

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `POST` | `/documents/upload` | ❌ New | Upload a document (multipart form). Returns `{ id, fileUrl, type, status }` |
| `GET` | `/documents/my-documents` | ❌ New | List current user's uploaded documents |
| `DELETE` | `/documents/:id` | ❌ New | Delete/replace a document |

### Merchant Document Types (from `MERCHANT_DOCUMENTS`)

| Key | Label | Required |
|-----|-------|----------|
| `business_license` | CAC Registration Certificate | ✅ Yes |
| `health_permit` | Health Permit (NAFDAC / State) | ✅ Yes |
| `owner_id` | Owner ID (NIN / Passport / License) | ✅ Yes |
| `insurance` | Business Insurance Policy | ❌ No |
| `tax_certificate` | TIN Certificate | ❌ No |
| `business_logo` | Business Logo | ✅ Yes |
| `cover_photo` | Cover Photo | ❌ No |

### Courier Document Types (from `COURIER_DOCUMENTS`)

| Key | Label | Required | Notes |
|-----|-------|----------|-------|
| `national_id` | National ID (NIN) / Passport | ✅ Yes | All couriers |
| `drivers_license` | Driver's License | ✅ Yes | Motorized vehicles only (not bicycle) |
| `vehicle_registration` | Vehicle Registration | ✅ Yes | Motorized vehicles only |
| `insurance` | Vehicle Insurance | ✅ Yes | Motorized vehicles only |
| `profile_photo` | Profile Photo | ✅ Yes | All couriers |
| `guarantor_form` | Guarantor Form | ✅ Yes | All couriers |

> **Note:** Bicycle couriers skip `drivers_license`, `vehicle_registration`, and `insurance`. The frontend uses `getCourierDocuments(vehicleType)` to filter.

### `POST /documents/upload` — Request (multipart/form-data)
```
file: <binary>
type: "business_license" | "health_permit" | "owner_id" | "insurance" | "tax_certificate" | "business_logo" | "cover_photo" | "drivers_license" | "vehicle_registration" | "national_id" | "profile_photo" | "guarantor_form"
```

### `POST /documents/upload` — Response
```json
{
  "id": "doc-uuid",
  "type": "business_license",
  "name": "CAC Registration Certificate",
  "fileUrl": "https://storage.example.com/docs/abc123.pdf",
  "status": "uploaded",
  "createdAt": "2026-02-12T00:00:00Z"
}
```

> **Note:** The existing `UploadModule` at `src/upload/` can likely be extended for this. Documents should be stored in S3/Cloudinary and referenced in the new `Document` Prisma model.

---

## 7. Business Category Management (Admin)

These endpoints power the **Business Categories** admin screen where admins create, edit, activate/deactivate, and delete business categories. Currently the frontend uses a local config file (`frontend/src/config/businessCategories.ts`). Once the backend serves these dynamically, the frontend will switch to API calls.

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/admin/categories` | ❌ New | List all business categories (active + inactive) |
| `POST` | `/admin/categories` | ❌ New | Create a new category |
| `PATCH` | `/admin/categories/:key` | ❌ New | Update a category (label, icon, color, description, sortOrder, active) |
| `DELETE` | `/admin/categories/:key` | ❌ New | Delete a category |
| `GET` | `/categories` | ❌ New | **Public** — list active categories only (for customer browse + merchant onboarding) |

### Category Shape (what the frontend expects)
```json
{
  "key": "restaurant",
  "label": "Restaurants",
  "icon": "restaurant",
  "description": "Dine-in, takeaway, and delivery restaurants",
  "color": "#ff6b35",
  "active": true,
  "sortOrder": 1
}
```

### `POST /admin/categories` — Request Body
```json
{
  "key": "shawarma",
  "label": "Shawarma Spots",
  "icon": "flame",
  "description": "Shawarma and wrap vendors",
  "color": "#d35400",
  "active": true,
  "sortOrder": 10
}
```

### Required: New Prisma Model — `BusinessCategory`
```prisma
model BusinessCategory {
  id          String   @id @default(uuid())
  key         String   @unique
  label       String
  icon        String
  description String   @default("")
  color       String   @default("#7f8c8d")
  active      Boolean  @default(true)
  sortOrder   Int      @default(99)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

> **Note:** The `key` is used as the `businessType` field on the `BusinessProfile` model. When a merchant registers, they select a category key. When a customer browses, they filter by category key.

### Screens that use categories
| Screen | How it uses categories |
|--------|----------------------|
| Admin: Category Management | Full CRUD |
| Merchant: Business Setup (onboarding) | Select one category |
| Merchant: Business Verification (edit profile) | Select one category |
| Customer: Home Screen | Browse by category |
| Customer: Category Browse | Filter businesses by category |

---

## 8. Courier Feature Endpoints (NEW — Full Uber Eats/Glovo Parity)

### 8.1 Order Management (Enhanced)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders/:id/accept` | Courier accepts an order (within timer window) |
| `POST` | `/orders/:id/decline` | Courier declines with reason |
| `PATCH` | `/orders/:id/status` | Update delivery status (heading_to_pickup → at_pickup → picked_up → heading_to_dropoff → arrived → delivered) |
| `POST` | `/orders/:id/delivery-proof` | Upload delivery proof photo + notes |
| `POST` | `/orders/:id/rate-customer` | Courier rates the customer (1-5 stars + tags + comment) |
| `GET` | `/orders/:id/details` | Full order details (items, modifiers, allergens, instructions, earnings breakdown) |
| `GET` | `/orders/available/deliveries` | Available deliveries with filters (nearby, high_pay, quick) |
| `GET` | `/orders/stacked` | Get stacked/batch order opportunities |

**Decline Reason Body:**
```json
{
  "reason": "too_far | low_pay | ending_shift | wrong_direction | restaurant_issue | vehicle_issue | personal | other",
  "details": "optional free text"
}
```

**Delivery Proof Body (multipart):**
```json
{
  "photo": "<file>",
  "notes": "Left with security guard",
  "deliveryType": "hand_to_customer | leave_at_door | meet_outside"
}
```

**Rate Customer Body:**
```json
{
  "rating": 4,
  "tags": ["friendly", "clear_instructions", "easy_to_find"],
  "comment": "optional"
}
```

### 8.2 Surge & Heat Map

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/courier/surge-zones` | Active surge zones with multipliers, estimated orders, expiry |
| `GET` | `/courier/hourly-demand` | Hourly demand forecast for today |
| `GET` | `/courier/surge-stats` | Current surge multiplier, active zones count, avg bonus |

**Surge Zone Shape:**
```json
{
  "id": "string",
  "area": "Victoria Island",
  "multiplier": 1.8,
  "estimatedOrders": 28,
  "distance": 2.5,
  "expiresIn": 18,
  "level": "low | medium | high | extreme",
  "coordinates": { "lat": 6.43, "lng": 3.42 }
}
```

### 8.3 Scheduling / Shift Booking (✅ FULLY IMPLEMENTED — Glovo Parity)

> **Updated: Feb 13, 2026** — Complete rewrite with real DB capacity, tier-based booking, zones, no-show penalties, admin CRUD.

#### Courier Endpoints

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/courier/schedule?week=2026-02-10&zone=default` | ✅ Done | Get week schedule with real capacity, tier info, no-show count |
| `POST` | `/courier/schedule/book` | ✅ Done | Book a shift (auto-approved, capacity + overlap + tier checks) |
| `DELETE` | `/courier/schedule/:bookingId` | ✅ Done | Drop a booked shift (warns if <2h before) |
| `GET` | `/courier/schedule/my-shifts` | ✅ Done | Get courier's upcoming booked shifts |
| `GET` | `/courier/schedule/zones` | ✅ Done | Get available scheduling zones |
| `GET` | `/courier/schedule/no-shows` | ✅ Done | Get courier's no-show history |

#### Admin Endpoints

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/admin/schedule/slots?zone=default` | ✅ Done | Get global schedule slot config |
| `POST` | `/admin/schedule/slots` | ✅ Done | Create/update a schedule slot |
| `DELETE` | `/admin/schedule/slots/:id` | ✅ Done | Delete a schedule slot |
| `GET` | `/admin/schedule/zones` | ✅ Done | Get all scheduling zones |
| `POST` | `/admin/schedule/zones` | ✅ Done | Create/update a zone |
| `DELETE` | `/admin/schedule/zones/:id` | ✅ Done | Delete a zone |
| `GET` | `/admin/schedule/stats?zone=&startDate=&endDate=` | ✅ Done | Booking stats (fill rate, no-shows, etc.) |
| `GET` | `/admin/schedule/no-shows?resolved=false` | ✅ Done | List all no-shows for review |
| `PATCH` | `/admin/schedule/no-shows/:id/resolve` | ✅ Done | Resolve a no-show penalty |
| `POST` | `/admin/schedule/no-shows/:courierId/:bookingId` | ✅ Done | Mark a courier as no-show |

#### Book Shift Body:
```json
{
  "slotId": "uuid",
  "date": "2026-02-14",
  "zone": "default"
}
```

#### Schedule Response Shape:
```json
{
  "schedule": [
    {
      "date": "2026-02-14",
      "canBook": true,
      "slots": [
        {
          "id": "uuid",
          "startTime": "12:00 PM",
          "endTime": "3:00 PM",
          "demand": "peak",
          "spotsLeft": 2,
          "totalSpots": 15,
          "estimatedEarnings": 18000,
          "surgeMultiplier": 1.5,
          "booked": false,
          "bookingId": null,
          "canBook": true
        }
      ]
    }
  ],
  "tier": "excellent",
  "bookingWindowDays": 7,
  "noShowCount": 0,
  "banned": false,
  "zone": "default"
}
```

#### Tier System (Glovo-style):
| Tier | Rating | Deliveries | Booking Window |
|------|--------|------------|----------------|
| Excellent | ≥4.8 | ≥200 | 7 days ahead |
| Good | ≥4.5 | ≥100 | 5 days ahead |
| Standard | Any | Any | 3 days ahead |

#### No-Show Penalties (escalating):
| Count (30 days) | Penalty |
|-----------------|---------|
| 1st | Warning |
| 2nd | Reduced priority |
| 3rd+ | Temporary booking ban |

#### New Prisma Models:
- `ScheduleSlot` — Global time block config (per zone)
- `ScheduleZone` — Geographic zones for scheduling
- `ScheduleNoShow` — No-show penalty tracking
- `CourierScheduleSlot` — Enhanced with `scheduleSlotId`, `zone`, `status`

#### Key Behaviors:
- **Auto-approved** — booking is instant if spots available (no admin approval)
- **Multiple slots per day** — allowed if times don't overlap
- **Real capacity** — `spotsLeft` computed from DB bookings count
- **Booked riders get order priority** — `hasActiveShift()` helper for order assignment
- **Late drop warning** — dropping <2h before shift triggers warning

### 8.4 Quests & Bonuses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/courier/quests` | Get active quests (daily, weekly, special) |
| `GET` | `/courier/quests/:id` | Get quest details + progress |
| `POST` | `/courier/quests/:id/claim` | Claim completed quest reward |
| `GET` | `/courier/quests/summary` | Total earned, completed count, streak |

**Quest Shape:**
```json
{
  "id": "string",
  "type": "daily | weekly | special",
  "title": "Lunch Rush",
  "description": "Complete 5 deliveries between 11 AM – 2 PM",
  "icon": "sunny",
  "color": "#f97316",
  "progress": 3,
  "target": 5,
  "reward": 2000,
  "expiresIn": "3h left",
  "completed": false,
  "claimed": false
}
```

### 8.5 Delivery Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/courier/preferences` | Get courier's delivery preferences |
| `PATCH` | `/courier/preferences` | Update delivery preferences |

**Preferences Body:**
```json
{
  "maxDistance": 10,
  "minPay": 500,
  "autoAccept": false,
  "autoAcceptSurge": false,
  "stackedOrders": true,
  "avoidHighways": false,
  "nightMode": false,
  "orderTypes": ["food", "grocery", "pharmacy"],
  "preferredZones": ["victoria_island", "lekki", "yaba"]
}
```

### 8.6 Referral Program

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/courier/referral` | Get referral code, link, stats |
| `GET` | `/courier/referral/history` | List of referred couriers + status |
| `POST` | `/courier/referral/apply` | Apply a referral code during signup |

**Referral Shape:**
```json
{
  "code": "MIKE2026",
  "link": "https://fulccrum.com/join?ref=MIKE2026",
  "totalReferred": 12,
  "totalEarned": 45000,
  "pendingEarnings": 10000,
  "referrals": [
    {
      "id": "string",
      "name": "Tunde A.",
      "date": "Feb 10, 2026",
      "status": "pending | active | completed",
      "deliveries": 18,
      "requiredDeliveries": 25,
      "earned": 0
    }
  ]
}
```

### 8.7 Tax & Earnings Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/courier/tax/monthly?month=2026-01` | Monthly earnings breakdown |
| `GET` | `/courier/tax/yearly?year=2025` | Annual tax summary |
| `POST` | `/courier/tax/export` | Email tax report (PDF) to courier |

**Monthly Period Shape:**
```json
{
  "key": "2026-01",
  "label": "January 2026",
  "totalEarnings": 285000,
  "deliveryFees": 195000,
  "tips": 62000,
  "bonuses": 28000,
  "deductions": 42000,
  "netIncome": 243000,
  "deliveries": 186,
  "distance": 892
}
```

### 8.8 Maintenance & Document Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/courier/reminders` | Get all document/vehicle reminders with expiry status |
| `PATCH` | `/courier/reminders/:id` | Update reminder (toggle notifications, update expiry) |
| `POST` | `/courier/maintenance-log` | Add maintenance log entry |
| `GET` | `/courier/maintenance-log` | Get maintenance history |

**Reminder Shape:**
```json
{
  "id": "string",
  "type": "document | vehicle | insurance | license",
  "title": "Vehicle Insurance",
  "expiryDate": "2026-02-28",
  "daysLeft": 16,
  "status": "expired | urgent | warning | ok",
  "notifyEnabled": true
}
```

### 8.9 Training / Onboarding

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/courier/training/modules` | Get all training modules + progress |
| `POST` | `/courier/training/:moduleId/complete-lesson` | Mark a lesson as completed |
| `GET` | `/courier/training/progress` | Overall training progress summary |

### 8.10 Insurance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/courier/insurance/plan` | Get current insurance plan |
| `GET` | `/courier/insurance/plans` | List available plans |
| `PATCH` | `/courier/insurance/plan` | Change insurance plan |
| `POST` | `/courier/insurance/claims` | File an insurance claim |
| `GET` | `/courier/insurance/claims` | Get claims history |

**Insurance Plan Shape:**
```json
{
  "id": "string",
  "name": "Standard Protection",
  "type": "basic | standard | premium",
  "monthlyPremium": 3500,
  "coverage": ["Accident coverage up to ₦500,000", "Third-party liability"],
  "maxCoverage": 500000,
  "active": true
}
```

### 8.11 Waiting Time Compensation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders/:id/waiting-started` | Mark that courier arrived at restaurant (start timer) |
| `GET` | `/orders/:id/waiting-time` | Get current waiting duration + compensation |

> Compensation rule: ₦50/min after 10 minutes of waiting at restaurant.

### 8.12 Push Notifications (Order Alerts)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/courier/fcm-token` | Register/update FCM push token |
| `DELETE` | `/courier/fcm-token` | Remove FCM token (logout) |

> Backend should send push notification when a new order is available for the courier, with sound alert. The `OrderRequestPopup` component handles the UI with a 30-second countdown timer.

### Prisma Models Needed

```prisma
model CourierScheduleSlot {
  id              String   @id @default(uuid())
  courierId       String
  date            DateTime
  startTime       String
  endTime         String
  demand          String   // low, medium, high, peak
  surgeMultiplier Float    @default(1.0)
  createdAt       DateTime @default(now())
  courier         User     @relation(fields: [courierId], references: [id])
}

model Quest {
  id          String   @id @default(uuid())
  type        String   // daily, weekly, special
  title       String
  description String
  icon        String
  color       String
  target      Int
  reward      Int
  startsAt    DateTime
  expiresAt   DateTime
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model CourierQuestProgress {
  id        String   @id @default(uuid())
  courierId String
  questId   String
  progress  Int      @default(0)
  completed Boolean  @default(false)
  claimed   Boolean  @default(false)
  updatedAt DateTime @updatedAt
  courier   User     @relation(fields: [courierId], references: [id])
  quest     Quest    @relation(fields: [questId], references: [id])
  @@unique([courierId, questId])
}

model CourierPreferences {
  id              String   @id @default(uuid())
  courierId       String   @unique
  maxDistance      Int      @default(10)
  minPay          Int      @default(0)
  autoAccept      Boolean  @default(false)
  autoAcceptSurge Boolean  @default(false)
  stackedOrders   Boolean  @default(true)
  avoidHighways   Boolean  @default(false)
  nightMode       Boolean  @default(false)
  orderTypes      String[] @default(["food", "grocery", "pharmacy"])
  preferredZones  String[] @default([])
  courier         User     @relation(fields: [courierId], references: [id])
}

model Referral {
  id                 String   @id @default(uuid())
  referrerId         String
  referredId         String
  status             String   @default("pending") // pending, active, completed
  deliveriesRequired Int      @default(25)
  deliveriesCompleted Int     @default(0)
  rewardAmount       Int      @default(5000)
  paidOut            Boolean  @default(false)
  createdAt          DateTime @default(now())
  referrer           User     @relation("referrer", fields: [referrerId], references: [id])
  referred           User     @relation("referred", fields: [referredId], references: [id])
}

model DeliveryProof {
  id        String   @id @default(uuid())
  orderId   String
  photoUrl  String
  notes     String?
  type      String   // hand_to_customer, leave_at_door, meet_outside
  createdAt DateTime @default(now())
  order     Order    @relation(fields: [orderId], references: [id])
}

model CustomerRating {
  id        String   @id @default(uuid())
  orderId   String
  courierId String
  customerId String
  rating    Int
  tags      String[]
  comment   String?
  createdAt DateTime @default(now())
}

model InsurancePlan {
  id             String   @id @default(uuid())
  name           String
  type           String   // basic, standard, premium
  monthlyPremium Int
  coverage       String[]
  maxCoverage    Int
  active         Boolean  @default(true)
}

model InsuranceClaim {
  id          String   @id @default(uuid())
  courierId   String
  type        String   // accident, medical, lost_goods
  description String
  amount      Int
  status      String   @default("pending") // pending, approved, rejected, paid
  createdAt   DateTime @default(now())
  courier     User     @relation(fields: [courierId], references: [id])
}

model MaintenanceLog {
  id        String   @id @default(uuid())
  courierId String
  action    String
  cost      Int
  mileage   String?
  date      DateTime
  createdAt DateTime @default(now())
  courier   User     @relation(fields: [courierId], references: [id])
}

model TrainingModule {
  id          String   @id @default(uuid())
  title       String
  description String
  icon        String
  color       String
  duration    String
  lessons     Int
  required    Boolean  @default(false)
  category    String   // onboarding, safety, skills, advanced
  sortOrder   Int      @default(0)
}

model CourierTrainingProgress {
  id               String   @id @default(uuid())
  courierId        String
  moduleId         String
  completedLessons Int      @default(0)
  updatedAt        DateTime @updatedAt
  courier          User     @relation(fields: [courierId], references: [id])
  module           TrainingModule @relation(fields: [moduleId], references: [id])
  @@unique([courierId, moduleId])
}

model SurgeZone {
  id              String   @id @default(uuid())
  area            String
  multiplier      Float
  estimatedOrders Int
  level           String   // low, medium, high, extreme
  latitude        Float
  longitude       Float
  radius          Float    // km
  expiresAt       DateTime
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
}
```

---

## 9. Existing Admin Endpoints (Already Working)

For reference, these endpoints already exist and are fully implemented:

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/users?page=1&limit=50` | List all users |
| `PATCH` | `/admin/users/:userId/suspend` | Suspend a user |
| `PATCH` | `/admin/users/:userId/activate` | Activate a user |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/orders?page=1&limit=50` | List all orders |
| `GET` | `/admin/metrics` | Platform metrics |

### Finance
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/withdrawals/pending` | Pending withdrawals |
| `POST` | `/admin/withdrawals/:id/approve` | Approve withdrawal |
| `POST` | `/admin/withdrawals/:id/reject` | Reject withdrawal |

### RBAC
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/rbac/roles` | Create role |
| `GET` | `/admin/rbac/roles` | List roles |
| `PATCH` | `/admin/rbac/roles/:id` | Update role |
| `POST` | `/admin/rbac/assign` | Assign role to user |
| `GET` | `/admin/rbac/audit-logs` | Get audit logs |

### Admin Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/admins` | List admin users |
| `POST` | `/admin/admins` | Create admin user |
| `DELETE` | `/admin/admins/:userId` | Remove admin |

---

## Summary of Work Needed (Updated Feb 14, 2026)

### ✅ DONE — Scheduling System (Glovo Parity)
All scheduling endpoints are fully implemented and tested end-to-end:
- Courier: `GET /courier/schedule`, `POST /courier/schedule/book`, `DELETE /courier/schedule/:bookingId`, `GET /courier/schedule/my-shifts`, `GET /courier/schedule/zones`, `GET /courier/schedule/no-shows`
- Admin: Full CRUD for slots and zones, stats, no-show management
- Prisma models: `ScheduleSlot`, `ScheduleZone`, `ScheduleNoShow` (migrated)
- Frontend: Admin `ScheduleManagementScreen` + Courier `SchedulingScreen` fully wired

### ✅ DONE — Courier Core Endpoints
All these exist in `courier.controller.ts` and work:
- Quests: `GET /courier/quests`, `GET /courier/quests/:id`, `POST /courier/quests/:id/claim`, `GET /courier/quests/summary`
- Surge: `GET /courier/surge-zones`, `GET /courier/hourly-demand`, `GET /courier/surge-stats`
- Preferences: `GET /courier/preferences`, `PATCH /courier/preferences`
- Tax: `GET /courier/tax/monthly`, `GET /courier/tax/yearly`, `POST /courier/tax/export`
- Insurance: `GET /courier/insurance/plan`, `GET /courier/insurance/plans`, `PATCH /courier/insurance/plan`, `POST /courier/insurance/claims`, `GET /courier/insurance/claims`
- Training: `GET /courier/training/modules`, `POST /courier/training/:moduleId/complete-lesson`, `GET /courier/training/progress`
- Maintenance: `GET /courier/reminders`, `PATCH /courier/reminders/:id`, `POST /courier/maintenance-log`, `GET /courier/maintenance-log`
- Referral: `GET /courier/referral`, `GET /courier/referral/history`, `POST /courier/referral/apply`
- Orders: `POST /courier/orders/:id/accept`, `POST /courier/orders/:id/decline`, `PATCH /courier/orders/:id/status`, `POST /courier/orders/:id/delivery-proof`, `POST /courier/orders/:id/rate-customer`, `GET /courier/orders/:id`, `GET /courier/orders/available`, `POST /courier/orders/:id/waiting-started`, `GET /courier/orders/:id/waiting-time`
- Fleet: `GET /courier/performance`, `GET /courier/predictions`, `GET /courier/dispatch`, `GET /courier/route-optimize/:orderId`, `GET /courier/delivery-methods`
- Gamification: `GET /courier/achievements`, `GET /courier/tiers`, `GET /courier/leaderboard`, `POST /courier/achievements/:achievementId/claim`
- Safety: `POST /courier/safety/emergency`, `GET /courier/support`, `POST /courier/support`, `POST /courier/safety/location-share`, `GET /courier/safety/events`

### Priority 1 — Missing Courier Endpoints (frontend wired, backend NOT built)
| Priority | Endpoint | Frontend API | Description |
|----------|----------|-------------|-------------|
| **P0** | `GET /courier/orders/history?status=&page=` | `courierOrdersAPI.getHistory()` | Past deliveries for courier. Query `Order` where `driverId = req.user.sub`. |
| **P0** | `GET /courier/orders/active` | `courierOrdersAPI.getActive()` | Active orders (stacked). Query `Order` where `driverId = req.user.sub` AND status IN ('accepted','picked_up','in_transit'). |
| **P1** | `POST /courier/verification/selfie` | `courierVerificationAPI.submitSelfie()` | Selfie identity verification (multipart upload). Needs `VerificationAttempt` Prisma model. |
| **P1** | `GET /courier/verification/status` | `courierVerificationAPI.getStatus()` | Current verification status. |
| **P1** | `GET /courier/verification/history` | `courierVerificationAPI.getHistory()` | Past verification attempts. |

### Priority 2 — Document System (blocks merchant/courier review)
1. Add `Document` model to Prisma schema
2. Run `prisma migrate`
3. Implement `GET /admin/merchants/:id/documents` (query Document table)
4. Implement `GET /admin/couriers/:id/documents` (query Document table)
5. Implement `PATCH .../documents/:docId/verify` and `/reject`
6. Build `POST /documents/upload` for merchant/courier onboarding
7. Build `GET /documents/my-documents` for merchants/couriers to see their uploads

### Priority 3 — Admin Stubs (need real logic)
1. `GET /admin/merchants/:id/application` — return full application with documents
2. `GET /admin/couriers` — already queries DB, just needs real data
3. `GET /admin/couriers/pending` — already queries DB, just needs real data
4. `POST /admin/merchants/:id/request-documents` — send email notification

### Priority 4 — Business Category CRUD
1. `GET /admin/categories` — list all business categories
2. `POST /admin/categories` — create category
3. `PATCH /admin/categories/:key` — update category
4. `DELETE /admin/categories/:key` — delete category
5. `GET /categories` — public, list active categories
6. Needs `BusinessCategory` Prisma model

### Priority 5 — Already done, just verify
1. `POST /report/content` — created, writes to ContentModerationQueue
2. `GET /report/my-reports` — created, queries by reportedBy in resourceData
3. All courier approve/reject/suspend/reactivate endpoints — wired up

---

## Frontend Files Reference

| Screen | File |
|--------|------|
| Merchant Applications | `frontend/src/screens/admin/MerchantApplicationReviewScreen.tsx` |
| Courier Management | `frontend/src/screens/admin/CourierManagementScreen.tsx` |
| Content Moderation | `frontend/src/screens/admin/content/ContentModerationScreen.tsx` |
| Merchant Compliance | `frontend/src/screens/admin/content/MerchantComplianceScreen.tsx` |
| Merchants | `frontend/src/screens/admin/MerchantsScreen.tsx` |
| Report Modal (customer) | `frontend/src/components/ReportContentModal.tsx` |
| API Service | `frontend/src/services/api.ts` (adminAPI, moderationAPI, reportAPI) |

---

## 9. Courier App — New Backend Endpoints Needed

> **Updated: Feb 13, 2026**
> These endpoints are called by the courier frontend screens. The frontend is fully built and wired — your teammate just needs to implement the backend handlers.

### 9.1 Order History

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/courier/orders/history` | ❌ NEW | Past deliveries for the authenticated courier |

**Query params:**
- `status` (optional): `delivered` \| `cancelled` \| `returned` — filter by status
- `page` (optional): number, default 1 (20 per page)

**Response:** `PastOrder[]`
```json
{
  "id": "string",
  "restaurant": "string",
  "customer": "string",
  "status": "delivered | cancelled | returned",
  "date": "string (relative: 'Today', 'Yesterday', '2 days ago')",
  "time": "string (e.g. '2:45 PM')",
  "basePay": 1200,
  "tip": 500,
  "bonus": 0,
  "total": 1700,
  "distance": "3.2 km",
  "duration": "18 min",
  "items": 3,
  "rating": 5,
  "pickupAddress": "string",
  "dropoffAddress": "string"
}
```

**Logic:** Query `Order` where `driverId = req.user.sub`, ordered by `createdAt DESC`. Filter by `status` if provided. Format relative dates. Paginate 20 per page.

**Frontend file:** `screens/courier/OrderHistoryScreen.tsx`
**API client:** `courierOrdersAPI.getHistory(status?, page?)`

---

### 9.2 Active Orders (Stacked Orders)

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/courier/orders/active` | ❌ NEW | All currently active orders for the courier |

**Response:** `ActiveOrder[]`
```json
{
  "id": "string",
  "restaurant": "string",
  "customer": "string",
  "status": "pickup | delivering",
  "estimatedTime": "12 min",
  "pay": 1700,
  "items": 3,
  "isActive": true,
  "pickupCoords": { "latitude": 6.52, "longitude": 3.37 },
  "dropoffCoords": { "latitude": 6.53, "longitude": 3.38 },
  "pickupAddress": "string",
  "dropoffAddress": "string"
}
```

**Logic:** Query `Order` where `driverId = req.user.sub` AND `status IN ('accepted', 'picked_up', 'in_transit')`. This powers the **stacked orders** feature — a courier can have 2+ active orders simultaneously.

**Frontend file:** `screens/courier/ActiveDeliveryScreen.tsx` (uses `StackedOrdersBanner` component)
**API client:** `courierOrdersAPI.getActive()`

---

### 9.3 Selfie Identity Verification

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `POST` | `/courier/verification/selfie` | ❌ NEW | Submit selfie photo for identity verification |
| `GET` | `/courier/verification/status` | ❌ NEW | Get current verification status |
| `GET` | `/courier/verification/history` | ❌ NEW | Get past verification attempts |

**POST `/courier/verification/selfie`**
- **Content-Type:** `multipart/form-data`
- **Body:** `selfie` (file field — JPEG/PNG image)
- **Response:**
```json
{
  "verified": true,
  "confidence": 0.95,
  "message": "Identity verified successfully"
}
```
or
```json
{
  "verified": false,
  "confidence": 0.3,
  "message": "Could not match your selfie. Please try again."
}
```

**Logic:** Compare uploaded selfie against the courier's profile photo / ID photo on file. Can use a simple image hash comparison for v1, or integrate a face-matching API later. Store each attempt in a `VerificationAttempt` table.

**GET `/courier/verification/status`**
- **Response:**
```json
{
  "verified": true,
  "lastVerifiedAt": "2026-02-13T10:30:00Z",
  "nextVerificationDue": "2026-02-20T10:30:00Z",
  "attemptsToday": 0
}
```

**GET `/courier/verification/history`**
- **Response:** Array of past verification attempts with timestamp, result, confidence score.

**Frontend file:** `screens/courier/SelfieVerificationScreen.tsx`
**API client:** `courierVerificationAPI.submitSelfie(formData)`, `.getStatus()`, `.getHistory()`

---

### 9.4 Notifications — Existing Endpoints (Enhancement Needed)

The notification CRUD endpoints already exist at `/notifications/*`. **No new endpoints needed**, but the notification model needs these fields if not already present:

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | One of: `order`, `promo`, `earnings`, `system`, `quest`, `safety`, `document` |
| `data` | `JSON` | Optional deep-link data: `{ screen: string, params?: object }` |

**Frontend file:** `screens/courier/NotificationsScreen.tsx`
**API client:** `notificationsAPI.getAll()`, `.markRead()`, `.markAllRead()`, `.delete()`

---

### 9.5 Required Prisma Model — `VerificationAttempt`

```prisma
model VerificationAttempt {
  id          String   @id @default(uuid())
  courierId   String
  courier     User     @relation(fields: [courierId], references: [id])
  photoUrl    String
  verified    Boolean
  confidence  Float    @default(0)
  reason      String?  // 'periodic', 'login', 'suspicious'
  createdAt   DateTime @default(now())
}
```

---

### 9.6 Summary — What to Build

| Priority | Endpoint | Controller | Service Method |
|----------|----------|------------|----------------|
| **P0** | `GET /courier/orders/history` | `courier.controller.ts` | `orderService.getOrderHistory(courierId, status?, page?)` |
| **P0** | `GET /courier/orders/active` | `courier.controller.ts` | `orderService.getActiveOrders(courierId)` |
| **P1** | `POST /courier/verification/selfie` | `courier.controller.ts` | New `verificationService.submitSelfie(courierId, file)` |
| **P1** | `GET /courier/verification/status` | `courier.controller.ts` | `verificationService.getStatus(courierId)` |
| **P1** | `GET /courier/verification/history` | `courier.controller.ts` | `verificationService.getHistory(courierId)` |
| **P2** | Enhance `Notification` model | `prisma/schema.prisma` | Add `type` + `data` fields |

### 9.7 Frontend Files Reference

| Screen / Component | File | API Client |
|---------------------|------|------------|
| Notifications | `screens/courier/NotificationsScreen.tsx` | `notificationsAPI` |
| Order History | `screens/courier/OrderHistoryScreen.tsx` | `courierOrdersAPI` |
| Stacked Orders Banner | `components/courier/StackedOrdersBanner.tsx` | `courierOrdersAPI` |
| Selfie Verification | `screens/courier/SelfieVerificationScreen.tsx` | `courierVerificationAPI` |
| Heat Map (with map overlays) | `screens/courier/HeatMapScreen.tsx` | `courierSurgeAPI` |
| Dashboard (auto-nav + live earnings) | `screens/courier/DashboardScreen.tsx` | `analyticsAPI`, `courierOrdersAPI` |

---

## 10. Customer App — New Backend Endpoints Required

> **Added: Feb 14, 2026**
> These endpoints are required by the new customer app features implemented in this sprint (P0/P1/P2 feature parity with Uber Eats / Glovo).

---

### 10.1 Scheduled / Future Orders

The frontend sends `scheduledFor` (ISO datetime string) in the order creation payload. The backend needs to:

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `POST` | `/orders` | 🔧 Enhance | Accept optional `scheduledFor` field. If present, set order status to `scheduled` instead of `pending`. Trigger preparation workflow at the right time. |

**Order payload additions:**
```json
{
  "scheduledFor": "2026-02-15T18:30:00",
  "fulfillmentType": "delivery" | "pickup",
  "deliveryOption": "hand_to_customer" | "leave_at_door" | "meet_outside",
  "deliveryNote": "Gate code 1234"
}
```

**Prisma schema changes needed:**
```prisma
// Add to Order model:
scheduledFor     DateTime?
fulfillmentType  String    @default("delivery") // "delivery" | "pickup"
deliveryOption   String?   // "hand_to_customer" | "leave_at_door" | "meet_outside"
deliveryNote     String?
```

---

### 10.2 Order Cancellation

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `POST` | `/orders/:orderId/cancel` | ✅ Exists | Cancel an order. Should only work for `pending` or `accepted` status. Body: `{ reason?: string }` |

**Backend logic needed:** Validate that order is in `pending` or `accepted` status. Refund payment if already charged. Notify restaurant and courier (if assigned). Set status to `cancelled`.

---

### 10.3 Post-Delivery Tipping

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `POST` | `/orders/:orderId/tip` | ❌ New | Add a tip after delivery. Body: `{ amount: number }`. Should credit the courier's wallet. |

**Backend logic:** Validate order is `delivered`. Validate tip amount > 0. Debit customer wallet/card. Credit courier wallet. Create transaction records. Send notification to courier.

---

### 10.4 Order Receipt / Invoice

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/orders/:orderId/receipt` | ❌ New | Generate and return order receipt data (or send via email). Returns JSON with full order breakdown. |

**Response shape:**
```json
{
  "orderNumber": "ABC123",
  "restaurant": "Restaurant Name",
  "items": [{ "name": "Item", "quantity": 2, "price": 1500 }],
  "subtotal": 3000,
  "deliveryFee": 500,
  "serviceFee": 150,
  "tax": 200,
  "tip": 100,
  "discount": 0,
  "total": 3950,
  "paymentMethod": "wallet",
  "deliveredAt": "2026-02-14T19:30:00Z",
  "deliveryAddress": "123 Main St, Lagos"
}
```

---

### 10.5 Active Promos for Customer

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/promos?activeOnly=true` | ✅ Exists | Get all active promos. Used by Deals screen. |

No new endpoint needed — existing `promosAPI.getAll(1, true)` works.

---

### 10.6 Business Hours & Open/Closed Status

The frontend checks `isOpen` and `businessHours` fields on restaurant objects. The backend needs to:

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `GET` | `/search/businesses` | 🔧 Enhance | Include `isOpen` (boolean), `businessHours` (JSON), `minimumOrder` (number), `priceRange` (string), `deliveryTime` (string) in response. |

**Prisma schema additions (Business model):**
```prisma
// Add to Business model if not present:
isOpen          Boolean   @default(true)
businessHours   Json?     // { "monday": { "open": "08:00", "close": "22:00" }, ... }
minimumOrder    Float?
priceRange      String?   // "₦", "₦₦", "₦₦₦"
estimatedDeliveryTime String? // "25-35 min"
```

---

### 10.7 Pickup Orders

The frontend sends `fulfillmentType: "pickup"` in the order payload. Backend needs to:

- Accept `fulfillmentType` field (`delivery` | `pickup`)
- Skip driver assignment for pickup orders
- Set `deliveryFee` to 0 for pickup
- Skip delivery address validation for pickup
- Different status flow: `pending` → `accepted` → `preparing` → `ready_for_pickup` → `picked_up`

**New OrderStatus enum values needed:**
```prisma
enum OrderStatus {
  // existing...
  ready_for_pickup
  picked_up
}
```

---

### 10.8 Delivery Instructions

Already handled by the enhanced order creation payload (Section 10.1). The `deliveryOption` and `deliveryNote` fields are sent with the order. Backend needs to:

- Store these fields on the Order model
- Pass them to the courier in the order details
- Display in courier's ActiveDeliveryScreen

---

### 10.9 Reorder

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `POST` | `/orders/:orderId/reorder` | ✅ Exists | Clone a past order's items into a new order. Should check item availability. |

---

### 10.10 Summary — New Endpoints to Build

| Priority | Endpoint | Controller | Service Method |
|----------|----------|------------|----------------|
| **P0** | `POST /orders/:id/tip` | `orders.controller.ts` | `ordersService.addTip(orderId, customerId, amount)` |
| **P0** | Enhance `POST /orders` | `orders.controller.ts` | Accept `scheduledFor`, `fulfillmentType`, `deliveryOption`, `deliveryNote` |
| **P0** | Enhance `GET /search/businesses` | `search.controller.ts` | Return `isOpen`, `businessHours`, `minimumOrder`, `priceRange`, `deliveryTime` |
| **P1** | `GET /orders/:id/receipt` | `orders.controller.ts` | `ordersService.getReceipt(orderId)` |
| **P1** | Pickup order flow | `orders.service.ts` | Handle `fulfillmentType: 'pickup'` — skip driver, different status flow |
| **P2** | Scheduled order cron | `orders.service.ts` | Process scheduled orders at their `scheduledFor` time |

### 10.11 Frontend Files Reference

| Screen / Component | File | API Client |
|---------------------|------|------------|
| Cart (checkout) | `screens/customer/CartScreen.tsx` | `ordersAPI`, `addressesAPI`, `feesAPI`, `promosAPI` |
| Order Tracking | `screens/customer/OrderTrackingScreen.tsx` | `ordersAPI`, `locationAPI` |
| Home (restaurant cards) | `screens/customer/HomeScreen.tsx` | `searchAPI`, `analyticsAPI` |
| Search (filters/sort) | `screens/customer/SearchScreen.tsx` | `searchAPI` |
| Restaurant (info/menu) | `screens/customer/RestaurantScreen.tsx` | `menuAPI` |
| Menu Item (suggestions) | `screens/customer/MenuItemScreen.tsx` | `menuAPI` |
| Deals & Offers | `screens/customer/DealsScreen.tsx` | `promosAPI`, `searchAPI` |
| Onboarding | `screens/customer/OnboardingScreen.tsx` | — (local only) |
| Feedback (photo reviews) | `screens/customer/FeedbackScreen.tsx` | `reviewsAPI`, `ordersAPI` |

### 10.12 New Utility Files Created

| File | Purpose |
|------|---------|
| `components/SkeletonLoader.tsx` | Reusable skeleton loading components (restaurant cards, menu items, orders) |
| `utils/haptics.ts` | Cross-platform haptic feedback utility (wraps expo-haptics) |
