# 🔴 Backend TypeScript Compilation Error Report

**Generated:** March 20, 2026 5:22 PM  
**Status:** 52 TypeScript errors preventing compilation  
**Root Cause:** Prisma client out of sync with schema

---

## 📊 Error Summary by Category

| Category | Count | Severity |
|----------|-------|----------|
| **Prisma Model Missing** | 45 | 🔴 Critical |
| **Google Maps API Types** | 2 | 🟡 Medium |
| **Firebase API Changes** | 1 | 🟡 Medium |
| **Provider Service Fields** | 3 | 🟡 Medium |
| **JSON Type Casting** | 1 | 🟢 Low |
| **Total** | **52** | **Critical** |

---

## 🔴 CRITICAL: Prisma Client Out of Sync (45 errors)

### **Root Cause:**
The Prisma schema was modified but `npx prisma generate` hasn't been run successfully. The generated Prisma client is missing these models in transaction contexts.

### **Missing Models in Transaction Context:**

#### **1. Core Models (15 errors)**
- `digitalWallet` - 8 occurrences
- `order` - 4 occurrences  
- `user` - 3 occurrences

**Files Affected:**
- `src/admin/admin-wallet.service.ts` (lines 89, 99, 195, 204, 279, 289, 304)
- `src/orders/orders.service.ts` (lines 112, 217, 227, 232, 239, 250, 448)
- `src/provider/provider.service.ts` (line 106)
- `src/users/users.service.ts` (line 160)

#### **2. Inventory & Menu Models (10 errors)**
- `inventory` - 4 occurrences
- `menuItem` - 4 occurrences
- `menuCategory` - 2 occurrences

**Files Affected:**
- `src/orders/orders.service.ts` (lines 60, 74, 87, 97, 103, 424, 430, 440)
- `src/provider/provider.service.ts` (lines 82, 91)

#### **3. Restaurant & Business Models (2 errors)**
- `restaurantProfile` - 1 occurrence
- `businessProfile` - 1 occurrence

**Files Affected:**
- `src/provider/provider.service.ts` (lines 20, 43)

#### **4. User-Related Models (10 errors)**
- `refreshToken` - 1 occurrence
- `deviceToken` - 1 occurrence
- `savedCard` - 1 occurrence
- `bankAccount` - 1 occurrence
- `address` - 1 occurrence
- `favorite` - 1 occurrence
- `passwordReset` - 1 occurrence
- `auditLog` - 3 occurrences

**Files Affected:**
- `src/users/users.service.ts` (lines 177, 182, 187, 192, 197, 202, 207)
- `src/admin/admin-wallet.service.ts` (lines 99, 204, 289)

#### **5. Courier Models (8 errors)**
- Quest progress tracking
- Training module progress

**Files Affected:**
- `src/courier/services/quest.service.ts` (lines 38, 42, 43)
- `src/courier/services/training.service.ts` (lines 24, 34)

---

## 🟡 MEDIUM: API Type Mismatches (6 errors)

### **1. Google Maps API Types (2 errors)**

**File:** `src/maps/maps.service.ts`

**Error 1 - Line 60:**
```typescript
// Current (WRONG):
mode: 'driving',

// Expected:
mode: TravelMode.driving,
```

**Error 2 - Line 61:**
```typescript
// Current (WRONG):
units: 'metric',

// Expected:
units: UnitSystem.metric,
```

**Fix Required:**
```typescript
import { TravelMode, UnitSystem } from '@googlemaps/google-maps-services-js';

// Then use:
mode: TravelMode.driving,
units: UnitSystem.metric,
```

---

### **2. Firebase Messaging API (1 error)**

**File:** `src/agent/agent.service.ts:203`

**Error:**
```typescript
Property 'sendEach' does not exist on type 'Messaging'
```

**Current Code:**
```typescript
const response = await messaging.sendEach(messages);
```

**Fix Required:**
The Firebase Admin SDK changed the API. Use `sendEachForMulticast` or `sendAll` instead:
```typescript
const response = await messaging.sendAll(messages);
// OR
const response = await messaging.sendEachForMulticast({
  tokens: deviceTokens,
  notification: { ... }
});
```

---

### **3. Provider Service Field Issues (3 errors)**

**File:** `src/provider/provider.service.ts`

**Error 1 - Lines 52, 63:**
```typescript
Property 'latitude' does not exist on BusinessProfile
```

**Cause:** The `BusinessProfile` model doesn't have `latitude`/`longitude` fields. Location data is stored in a different format.

**Error 2 - Line 110:**
```typescript
Type '"pending_approval"' is not assignable to type 'UserStatus'
```

**Cause:** The `UserStatus` enum doesn't include `pending_approval`. Valid values are likely: `active`, `inactive`, `suspended`, `banned`.

**Fix Required:**
Check the Prisma schema for correct field names and enum values.

---

### **4. JSON Type Casting (2 errors)**

**File:** `src/services/services.service.ts:96-97`

**Error:**
```typescript
Property 'lat' does not exist on type 'JsonValue'
Property 'lng' does not exist on type 'JsonValue'
```

**Current Code:**
```typescript
provider.serviceArea.lat,
provider.serviceArea.lng,
```

**Fix Required:**
Cast the JSON value properly:
```typescript
const serviceArea = provider.serviceArea as { lat: number; lng: number };
serviceArea.lat,
serviceArea.lng,
```

---

## 🎯 Fix Priority & Order

### **Phase 1: Critical - Prisma Client (MUST FIX FIRST)**

**Action:**
```bash
cd backend
npx prisma generate
```

**Expected Result:** All 45 Prisma-related errors will be resolved.

**If `prisma generate` fails:**
1. Check if `DATABASE_URL` is set in `.env`
2. Verify Prisma schema syntax is valid
3. Try: `npm install prisma @prisma/client --legacy-peer-deps`
4. Then retry: `npx prisma generate`

---

### **Phase 2: Medium - API Type Fixes (6 errors)**

**File 1:** `src/maps/maps.service.ts`
- Import `TravelMode` and `UnitSystem` enums
- Replace string literals with enum values
- **Time:** 2 minutes

**File 2:** `src/agent/agent.service.ts`
- Replace `sendEach` with `sendAll` or `sendEachForMulticast`
- **Time:** 3 minutes

**File 3:** `src/provider/provider.service.ts`
- Remove `latitude`/`longitude` references or fix field names
- Change `'pending_approval'` to valid `UserStatus` enum value
- **Time:** 5 minutes

**File 4:** `src/services/services.service.ts`
- Add type casting for JSON `serviceArea` field
- **Time:** 2 minutes

---

## 📋 Detailed File-by-File Breakdown

### **1. admin-wallet.service.ts (7 errors)**
- Lines 89, 195, 279: `tx.digitalWallet` not found
- Lines 99, 204, 289, 304: `tx.auditLog` not found
- **Fix:** Regenerate Prisma client

### **2. orders.service.ts (17 errors)**
- Lines 60, 103: `tx.menuItem` not found
- Lines 74, 87, 97, 424, 430: `tx.inventory` not found
- Lines 112, 250, 448: `tx.order` not found
- Lines 217, 227, 232, 239: `tx.digitalWallet` not found
- **Fix:** Regenerate Prisma client

### **3. provider.service.ts (7 errors)**
- Line 20: `tx.restaurantProfile` not found
- Line 43: `tx.businessProfile` not found
- Lines 52, 63: `latitude` field doesn't exist
- Line 82: `tx.menuCategory` not found
- Line 91: `tx.menuItem` not found
- Line 106: `tx.user` not found
- Line 110: Invalid `UserStatus` enum value
- **Fix:** Regenerate Prisma client + fix field names + fix enum

### **4. users.service.ts (8 errors)**
- Line 160: `tx.user` not found
- Line 177: `tx.refreshToken` not found
- Line 182: `tx.deviceToken` not found
- Line 187: `tx.savedCard` not found
- Line 192: `tx.bankAccount` not found
- Line 197: `tx.address` not found
- Line 202: `tx.favorite` not found
- Line 207: `tx.passwordReset` not found
- **Fix:** Regenerate Prisma client

### **5. maps.service.ts (2 errors)**
- Lines 60-61: String literals instead of enums
- **Fix:** Import and use `TravelMode.driving` and `UnitSystem.metric`

### **6. agent.service.ts (1 error)**
- Line 203: `sendEach` doesn't exist
- **Fix:** Use `sendAll` or `sendEachForMulticast`

### **7. quest.service.ts (3 errors)**
- Lines 38, 42, 43: JSON type casting issues
- **Fix:** Add proper type casting for progress object

### **8. training.service.ts (2 errors)**
- Lines 24, 34: JSON type casting issues
- **Fix:** Add proper type casting for progress object

### **9. services.service.ts (2 errors)**
- Lines 96-97: JSON type casting for `serviceArea`
- **Fix:** Cast to `{ lat: number; lng: number }`

---

## ✅ Verification Steps

After fixes:
1. Run `npm run build` - should complete with 0 errors
2. Run `npm run start:dev` - server should start
3. Check logs for any runtime errors
4. Test API endpoints

---

## 🔧 Quick Fix Commands

```bash
# Step 1: Fix Prisma (resolves 45 errors)
cd backend
npx prisma generate

# Step 2: Rebuild
npm run build

# Step 3: If still errors, fix the 6 API type issues manually
# (See Phase 2 above for specific changes)

# Step 4: Start server
npm run start:dev
```

---

**Report Generated:** March 20, 2026  
**Total Errors:** 52  
**Estimated Fix Time:** 15-20 minutes (if Prisma generates successfully)
