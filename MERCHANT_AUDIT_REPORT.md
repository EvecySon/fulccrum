# Merchant App Full Audit Report
**Date:** Feb 9, 2026

## Summary
- **21 merchant frontend screens** audited
- **12 merchant-relevant backend modules** audited
- **Status:** Most screens are wired to real backend endpoints. Several have data mapping issues, stub backends, or missing features.

---

## 1. SCREENS WITH REAL DATA (Working Well)

### DashboardScreen ✅ (just fixed)
- **APIs:** `analyticsAPI.dashboard()`, `ordersAPI.getBusinessOrders()`, `analyticsAPI.merchantAnalytics('week')`, `reviewsAPI.getBusinessReviews()`, `menuAPI.getBusinessHours()`
- **Status:** All cards, chart, orders, reviews mapped to real data. Navigation fixed.

### OrdersScreen ✅ (just fixed)
- **APIs:** `ordersAPI.getBusinessOrders('me')`, `ordersAPI.updateStatus()`
- **Status:** Real data, correct field mapping, search, status filters all working.

### MenuScreen ✅ (just fixed)
- **APIs:** `menuAPI.getCategories()`, `menuAPI.createCategory()`, `menuAPI.createItem()`, `menuAPI.updateItem()`, `menuAPI.deleteItem()`, `menuAPI.toggleAvailability()`, `uploadAPI.uploadImage()`
- **Status:** Full CRUD, photo upload, search all working.

### AnalyticsScreen ✅
- **APIs:** `analyticsAPI.merchantAnalytics(period)`
- **Status:** Real data from backend. KPIs, hourly chart, peak hours, top items, customer insights all mapped correctly.
- **Issue:** Export button has no handler (cosmetic).

### ReviewsScreen ✅
- **APIs:** `reviewsAPI.getBusinessReviews('me')`, `reviewsAPI.getBusinessStats('me')`, `reviewsAPI.respond()`, `reviewsAPI.markHelpful()`
- **Status:** Real data, respond to reviews, mark helpful all working.

### BusinessHoursScreen ✅
- **APIs:** `menuAPI.getBusinessHours('me')`, `menuAPI.setBusinessHours()`
- **Status:** Real data, save hours working.

### PromotionsScreen ✅
- **APIs:** `promosAPI.getAll()`, `promosAPI.create()`, `promosAPI.update()`, `promosAPI.delete()`, `promosAPI.toggle()`, `promosAPI.getStats()`
- **Status:** Full CRUD, toggle, stats all working with real Prisma data.

### DeliveryZonesScreen ✅
- **APIs:** `zonesAPI.getBusinessZones('me')`, `zonesAPI.create()`, `zonesAPI.update()`, `zonesAPI.delete()`
- **Status:** Full CRUD working with real Prisma data.

### WalletScreen ✅
- **APIs:** `walletAPI.getBalance()`, `walletAPI.getBankAccounts()`, `walletAPI.withdrawalHistory()`, `walletAPI.requestWithdrawal()`
- **Status:** Real data from Prisma. Withdrawal flow working.

### BankAccountsScreen ✅
- **APIs:** `walletAPI.getBankAccounts()`, `walletAPI.addBankAccount()`, `walletAPI.setDefaultBankAccount()`, `walletAPI.deleteBankAccount()`
- **Status:** Full CRUD working with real Prisma data.

### NotificationsScreen ✅ (just created)
- **APIs:** `notificationsAPI.getAll()`, `notificationsAPI.markRead()`
- **Status:** Real data, mark read working.

### BusinessVerificationScreen ✅
- **APIs:** `usersAPI.getProfile()`, `usersAPI.updateBusinessProfile()`, `uploadAPI.uploadImage()`, `uploadAPI.uploadDocument()`
- **Status:** Multi-step form, document upload, edit existing profile all working.

### PaymentScreen ✅
- **APIs:** `paymentAPI.initialize()`
- **Status:** Registration fee payment flow working.

---

## 2. SCREENS WITH STUB/PARTIAL BACKENDS (Need Backend Work)

### SmartKitchenScreen ⚠️
- **APIs:** `kitchenAPI.getOperations()`, `kitchenAPI.getInventory()`, `kitchenAPI.startPrep()`, `kitchenAPI.completePrep()`
- **Backend:** Real Prisma queries for operations (fetches accepted/preparing orders). Inventory returns menu items with isAvailable.
- **Issues:**
  - `estimatedPrepTime` is hardcoded to 15 minutes
  - `getPrepPredictions()` returns hardcoded stub data
  - Kitchen inventory `quantity` is always 0 (no stock tracking in Prisma schema)

### AIInsightsScreen ⚠️
- **APIs:** `merchantInsightsAPI.getAllInsights()`, `merchantInsightsAPI.implementInsight()`, `merchantInsightsAPI.dismissInsight()`
- **Backend:** Returns 3 hardcoded insight types based on real order count and menu item count.
- **Issues:**
  - `implementInsight()` and `dismissInsight()` are no-ops (return message only, don't persist)
  - Insights are regenerated on every request (no persistence)
  - No real AI/ML — just template strings with counts

### CRMScreen ⚠️
- **APIs:** `merchantCrmAPI.getCustomerProfiles()`, `merchantCrmAPI.getCampaigns()`, `merchantCrmAPI.createCustomerProfile()`, `merchantCrmAPI.createCampaign()`
- **Backend:** Real Prisma queries for customers (from orders) and CRM notes/campaigns.
- **Issues:**
  - `totalOrders` and `totalSpent` per customer are always 0 (not aggregated)
  - `favoriteItems` is always empty
  - `loyaltyScore` is hardcoded to 50
  - Loyalty program is a stub (not persisted)
  - Campaign `effectiveness` is never calculated

### MultiChannelScreen ⚠️ (just fixed frontend)
- **APIs:** `channelsAPI.getChannels()`, `channelsAPI.updateChannel()`, `channelsAPI.getSubscriptions()`, `channelsAPI.createSubscription()`, `channelsAPI.deleteSubscription()`
- **Backend:** Returns hardcoded channel list. Subscriptions return empty array.
- **Issues:**
  - Channels are hardcoded (not persisted in DB) — toggling doesn't persist across restarts
  - Subscriptions are not persisted (createSubscription returns fake ID)
  - No Prisma models for channels or subscriptions
  - Revenue per channel is always 0

### DynamicPricingScreen ⚠️
- **APIs:** `dynamicPricingAPI.getRules()`, `dynamicPricingAPI.createRule()`, `dynamicPricingAPI.toggleRule()`, `dynamicPricingAPI.deleteRule()`
- **Backend:** All stubs — `getRules()` returns empty array, create/update/delete/toggle return messages only.
- **Issues:**
  - No Prisma model for pricing rules
  - Nothing is persisted
  - `getPreview()` returns zeros

### FlashSalesScreen ✅ (Real Prisma)
- **APIs:** `flashSalesAPI.getAll()`, `flashSalesAPI.create()`, `flashSalesAPI.update()`, `flashSalesAPI.toggle()`, `flashSalesAPI.delete()`
- **Backend:** Full CRUD with real Prisma FlashSale model. Toggle, create, update, delete all persist.
- **Status:** Working correctly. No issues found.

### InventoryScreen ⚠️
- **APIs:** `menuAPI.getInventory()`, `menuAPI.updateInventory()`
- **Backend:** Menu controller has inventory endpoints. Prisma has separate `Inventory` model with `currentStock`, `minimumStock`, `unit`, `costPerUnit`.
- **Issues:**
  - Frontend calls `menuAPI.getInventory()` → `GET /menu/inventory` — need to verify this endpoint uses the Inventory model (not MenuItem.isAvailable)
  - Frontend calls `menuAPI.updateInventory(itemId, { currentStock })` → need to verify it updates Inventory model
  - Kitchen screen's inventory uses `kitchenAPI.getInventory()` which returns MenuItem.isAvailable (different from Inventory model)

---

## 3. SETTINGS SCREEN AUDIT

### SettingsScreen ✅ (mostly working)
- **APIs:** `usersAPI.getProfile()`, `usersAPI.updateBusinessProfile()`, `usersAPI.deleteAccount()`, `usersAPI.exportData()`, `menuAPI.getBusinessHours()`, `promosAPI.getAll()`, `flashSalesAPI.getAll()`, `walletAPI.getBankAccounts()`
- **Navigation links to:** Reviews, Inventory, BusinessHours, DeliveryZones, Promotions, FlashSales, BankAccounts, Wallet, BusinessVerification, MerchantPayment
- **Issues:**
  - `autoAcceptOrders` ✅ exists in Prisma
  - `minimumOrderAmount` ✅ exists — but frontend uses `minOrderAmount` (field name mismatch)
  - `deliveryRadius` ✅ exists — but frontend uses `maxDeliveryDistance` (field name mismatch)
  - `averagePreparationTime` ✅ exists — but frontend uses `estimatedPrepTime` (field name mismatch)
  - Export data endpoint — need to verify if `usersAPI.exportData()` is implemented

---

## 4. FRONTEND → BACKEND ENDPOINT MISMATCHES

| Frontend API Call | Backend Route | Status |
|---|---|---|
| `menuAPI.getInventory()` → `GET /menu/inventory` | Menu controller | ⚠️ May not have dedicated inventory endpoint |
| `menuAPI.updateInventory()` → `PUT /menu/inventory/:id` | Menu controller | ⚠️ May not exist |
| `menuAPI.getLowStock()` → `GET /menu/inventory/low-stock` | Menu controller | ⚠️ May not exist |
| `usersAPI.exportData()` → `POST /users/export-data` | Users controller | ⚠️ Likely stub |
| `usersAPI.deleteAccount()` → `DELETE /users/account` | Users controller | ⚠️ Need to verify |

---

## 5. MISSING FEATURES / SCREENS

### No Screen Exists For:
1. **Catering Orders** — Backend has `GET/POST /merchant/catering` but no dedicated screen (only accessible via MultiChannel)
2. **Loyalty Program Management** — Backend has `GET/PATCH /merchant/crm/loyalty` but no dedicated screen (only in CRM)
3. **Order Detail/Chat** — `OrderChat` screen is registered but not navigated to from OrdersScreen

### Buttons With No Handler:
1. **AnalyticsScreen "Export" button** — No export functionality implemented
2. **DynamicPricingScreen "Create Rule" button** — Creates rule but backend doesn't persist

---

## 6. PRISMA SCHEMA VERIFICATION

### Fields that DO exist ✅:
- `BusinessProfile.autoAcceptOrders` ✅ (Boolean, default false)
- `BusinessProfile.minimumOrderAmount` ✅ (Decimal) — frontend uses `minOrderAmount`, backend field is `minimumOrderAmount`
- `BusinessProfile.deliveryRadius` ✅ (Decimal) — frontend uses `maxDeliveryDistance`, backend field is `deliveryRadius`
- `BusinessProfile.averagePreparationTime` ✅ (Int, default 15)
- `Inventory.currentStock` ✅ (separate Inventory model, linked to MenuItem)
- `Inventory.minimumStock` ✅ (equivalent of lowStockThreshold)
- `FlashSale` model ✅ (full model with discountType, discountValue, startsAt, endsAt, isActive, itemsSold, maxQuantity)
- `CrmCustomerNote` model ✅
- `CrmCampaign` model ✅

### Models that DON'T exist ❌:
- **Channels model** ❌ — fully hardcoded in service, no persistence
- **Subscriptions model** ❌ — createSubscription returns fake ID, no persistence
- **PricingRule model** ❌ — getRules returns empty, create/update/delete are no-ops

### Field Name Mismatches ⚠️:
- Frontend `minOrderAmount` → Backend `minimumOrderAmount`
- Frontend `maxDeliveryDistance` → Backend `deliveryRadius`
- Frontend `estimatedPrepTime` → Backend `averagePreparationTime`
- Frontend `menuAPI.getInventory()` → Separate `Inventory` Prisma model (not on MenuItem directly)
- Frontend `menuAPI.updateInventory(itemId, { currentStock })` → Should update Inventory model, not MenuItem

---

## 7. PRIORITY FIX LIST

### P0 — Critical (Broken/Crashing)
- [x] MultiChannelScreen crash (ch.revenue undefined) — FIXED
- [x] Dashboard navigation (wrong route names) — FIXED
- [x] Dashboard data mapping (wrong field names) — FIXED

### P1 — High (Data Not Showing)
- [ ] CRM customer `totalOrders`/`totalSpent` always 0 — needs aggregation query
- [ ] Kitchen `estimatedPrepTime` hardcoded — needs real calculation
- [ ] Channels not persisted — needs Prisma model or at least in-memory state per merchant
- [ ] Inventory `currentStock` — verify Prisma field exists, add if missing

### P2 — Medium (Stubs Need Real Implementation)
- [ ] DynamicPricing — needs Prisma model + real CRUD
- [ ] AI Insights — implement/dismiss should persist
- [ ] Flash Sales — verify Prisma model exists
- [ ] Campaign effectiveness — needs calculation logic
- [ ] Analytics Export button — implement CSV/PDF export

### P3 — Low (Nice to Have)
- [ ] Catering orders screen
- [ ] Order detail screen with chat integration
- [ ] Loyalty program dedicated screen
- [ ] Prep time predictions (ML)
- [ ] Real AI insights (not templates)

---

## 8. NAVIGATION MAP (All Verified Working)

```
MerchantTabs (Bottom Tab Navigator)
├── Dashboard → Notifications (stack), Orders/Menu/Analytics/Settings (tabs)
├── Orders
├── Menu
├── Analytics
└── Settings → Reviews, Inventory, BusinessHours, DeliveryZones,
                Promotions, FlashSales, BankAccounts, Wallet,
                BusinessVerification, MerchantPayment

Stack Screens (from Dashboard Advanced Tools):
├── SmartKitchen
├── AIInsights
├── CRM
├── MultiChannel
├── DynamicPricing
├── Notifications
├── OrderChat
└── Call
```

All navigation routes verified to match registered screen names.
