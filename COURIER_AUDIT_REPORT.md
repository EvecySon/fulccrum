# Courier System Audit Report
**Generated:** March 24, 2026  
**Scope:** All 27 courier frontend screens + backend endpoints + dark mode system

---

## Executive Summary

| Category | Status | Details |
|----------|--------|---------|
| Backend Endpoints | ✅ Mostly Complete | All courier API endpoints exist and are wired up |
| Frontend-Backend Wiring | ⚠️ Partial | API calls exist but 15+ screens fall back to mock data on error |
| Mock/Fake Data | 🔴 Critical | 16 screens still display hardcoded mock data as default |
| Dark Mode | 🔴 Not Working | Theme system exists but 0/27 courier screens use it |
| Online/Offline Status | ⚠️ Local Only | Toggle is frontend-only, not synced with backend |

---

## 🔴 CRITICAL: Dark Mode Not Applied (All 27 Screens)

**Problem:** A full dark mode system exists (`ThemeContext.tsx`, `darkColors.ts`, `ThemeSettingsScreen.tsx`) but **no courier screen actually uses it**. All 27 screens import `colors` directly from `theme/colors` (always light mode) instead of using `useTheme()`.

**Impact:** Users can toggle dark mode in settings, the UI says "Currently using: Dark mode" — but nothing changes visually. This is a broken promise to the user.

**Screens affected (all 27):**
- `DashboardScreen.tsx`
- `DeliveriesScreen.tsx`
- `ActiveDeliveryScreen.tsx`
- `OrderDetailsScreen.tsx`
- `OrderHistoryScreen.tsx`
- `EarningsScreen.tsx`
- `WalletScreen.tsx`
- `PerformanceScreen.tsx`
- `ProfileScreen.tsx`
- `HeatMapScreen.tsx`
- `GamificationScreen.tsx`
- `QuestsScreen.tsx`
- `SchedulingScreen.tsx`
- `DeliveryPreferencesScreen.tsx`
- `ReferralScreen.tsx`
- `InsuranceScreen.tsx`
- `SafetyScreen.tsx`
- `TrainingScreen.tsx`
- `VehicleManagementScreen.tsx`
- `MaintenanceRemindersScreen.tsx`
- `TaxSummaryScreen.tsx`
- `DocumentVerificationScreen.tsx`
- `SelfieVerificationScreen.tsx`
- `NotificationsScreen.tsx`
- `PaymentScreen.tsx`
- `LanguageSettingsScreen.tsx`
- `ThemeSettingsScreen.tsx` (only one using useTheme, but styles still use light colors)

**Fix Required (per screen):**
```tsx
// BEFORE (broken):
import { colors } from '../../theme/colors';

// AFTER (working):
import { useTheme } from '../../theme/ThemeContext';
// Inside component:
const { colors } = useTheme();
```

**Effort:** ~2 lines changed per screen × 27 screens = ~54 line changes

---

## 🔴 CRITICAL: Mock/Hardcoded Data in 16 Screens

These screens show **fake data** by default. Most attempt API calls but fall back to mock data on error — which means if the backend returns any error, users see fake data with no indication it's fake.

### Screen-by-Screen Breakdown:

#### 1. `DashboardScreen.tsx` — ⚠️ Partial Mock
- **Mock:** `recentDeliveries` (hardcoded 3 fake deliveries), `hourlyEarnings` (fake chart data)
- **Mock:** Imports `mockCourierStats` from `data/mockData`
- **Mock:** Simulates incoming order after 5 seconds (demo order from "Chicken Republic")
- **Real:** Fetches stats from `analyticsAPI.dashboard()`, accept/decline call real API
- **Fix:** Replace hardcoded deliveries with API call, remove simulated order

#### 2. `WalletScreen.tsx` — ⚠️ Partial Mock
- **Mock:** `mockWallet` (₦78,500 balance), `mockBankAccounts`, `mockTransactions`
- **Real:** Attempts `walletAPI.getBalance()`, `walletAPI.getBankAccounts()`, `walletAPI.withdrawalHistory()`
- **Issue:** Falls back to mock data silently on API error. Withdrawal catch block "simulates success"
- **Fix:** Remove mock fallbacks, show error states instead

#### 3. `GamificationScreen.tsx` — ⚠️ Heavy Mock
- **Mock:** `mockTier` (Gold tier, 72% progress), `mockAchievements` (5 fake), `mockLeaderboard` (5 fake)
- **Real:** Attempts gamification API calls
- **Issue:** Tier card always shows mock data — never fetched from API
- **Fix:** Fetch tier data from API, remove hardcoded tier

#### 4. `ReferralScreen.tsx` — 🔴 Heavy Mock
- **Mock:** `mockReferralCode` ('MIKE2026'), `mockReferralLink`, `mockReferrals` (4 fake), `mockStats`
- **Real:** Attempts `courierReferralAPI.getInfo()` and `courierReferralAPI.getHistory()`
- **Issue:** Referral code is ALWAYS hardcoded 'MIKE2026' — never from API. Share/copy always uses fake code.
- **Fix:** Load referral code from API response, only show after loaded

#### 5. `VehicleManagementScreen.tsx` — 🔴 Heavy Mock
- **Mock:** `mockMethods` (5 delivery methods), `mockVehicleInfo` (Honda CG 125 details)
- **Real:** Attempts `courierFleetAPI.getDeliveryMethods()`
- **Issue:** Vehicle info section ALWAYS shows hardcoded "Honda CG 125" — never from API
- **Fix:** Fetch vehicle info from API, add vehicle registration endpoint if missing

#### 6. `HeatMapScreen.tsx` — ⚠️ Partial Mock
- **Mock:** `mockSurgeZones` (6 fake zones), `mockHourlyDemand` (14 hours), `mockStats`
- **Real:** Attempts surge API calls
- **Issue:** Falls back to mock data on error
- **Fix:** Show proper empty/error states

#### 7. `InsuranceScreen.tsx` — 🔴 Heavy Mock
- **Mock:** `mockCurrentPlan`, `mockPlans` (3 plans), `mockClaims` (3 fake claims)
- **Real:** Attempts insurance API calls
- **Issue:** Available plans list ALWAYS uses `mockPlans` — never from API
- **Fix:** Fetch plans from API

#### 8. `PerformanceScreen.tsx` — 🔴 Heavy Mock
- **Mock:** `mockPerformance`, `mockPredictions` (4 fake), `mockWeeklyStats` (7 days)
- **Real:** Attempts `courierFleetAPI.getPerformance()`
- **Issue:** Weekly stats chart and predictions ALWAYS show mock data
- **Fix:** Fetch weekly stats and predictions from API

#### 9. `OrderHistoryScreen.tsx` — ⚠️ Partial Mock
- **Mock:** `mockHistory` (8 fake past orders)
- **Real:** Attempts `courierOrdersAPI.getHistory()`
- **Issue:** Falls back to mock on first page error
- **Fix:** Show empty state instead of fake orders

#### 10. `DeliveriesScreen.tsx` — ⚠️ Partial Mock
- **Mock:** `mockAvailableDeliveries` from `data/mockData`
- **Real:** Attempts `courierOrdersAPI.getAvailable()`
- **Fix:** Show empty state on error

#### 11. `QuestsScreen.tsx` — ⚠️ Partial Mock
- **Mock:** `mockQuests` (9 fake quests), `mockSummary`
- **Real:** Attempts `courierQuestsAPI.getQuests()`
- **Fix:** Remove mock fallback, show empty state

#### 12. `MaintenanceRemindersScreen.tsx` — 🔴 Heavy Mock
- **Mock:** `mockReminders` (7 fake reminders), `mockMaintenanceLog` (4 fake logs)
- **Real:** Attempts maintenance API calls
- **Fix:** Remove mock fallback

#### 13. `NotificationsScreen.tsx` — ⚠️ Partial Mock
- **Mock:** `mockNotifications` (8 fake notifications)
- **Real:** Attempts notification API call
- **Issue:** Falls back to mock if API returns empty or errors
- **Fix:** Show "No notifications" instead of fake ones

#### 14. `SelfieVerificationScreen.tsx` — Minor Mock
- Has console.log debug statements
- Otherwise functional

#### 15. `TaxSummaryScreen.tsx` — Minor Mock
- Has console.log debug statements
- Otherwise functional

#### 16. `SafetyScreen.tsx` — Minor Mock
- Has console.log debug statements
- Otherwise functional

---

## ✅ Backend Endpoints Status (All Exist)

| API Group | Endpoint Count | Controller | Status |
|-----------|---------------|------------|--------|
| Quests | 4 | `courier.controller.ts` | ✅ Implemented |
| Surge Zones | 3 | `courier.controller.ts` | ✅ Implemented |
| Preferences | 2 | `courier.controller.ts` | ✅ Implemented |
| Tax/Earnings | 3 | `courier.controller.ts` | ✅ Implemented |
| Insurance | 5 | `courier.controller.ts` | ✅ Implemented |
| Training | 3 | `courier.controller.ts` | ✅ Implemented |
| Scheduling | 6 | `courier.controller.ts` | ✅ Implemented |
| Maintenance | 4 | `courier.controller.ts` | ✅ Implemented |
| Orders | 10 | `courier.controller.ts` | ✅ Implemented |
| Referral | 3 | `courier.controller.ts` | ✅ Implemented |
| Verification | 4 | `courier.controller.ts` | ✅ Implemented |
| Performance | 5 | `courier-fleet.controller.ts` | ✅ Implemented |
| Gamification | 4 | `courier-gamification.controller.ts` | ✅ Implemented |
| Safety | 5 | `courier-safety.controller.ts` | ✅ Implemented |
| Wallet | 4+ | `wallet.controller.ts` | ✅ Implemented |
| Analytics | 3+ | `analytics.controller.ts` | ✅ Implemented |

**Total: 68+ courier-related backend endpoints — all exist.**

### ⚠️ Backend Issues Found:

1. **Insurance Plans Endpoint** (`GET /courier/insurance/plans`) — Returns hardcoded JSON array in controller instead of fetching from database
2. **Insurance Current Plan** (`GET /courier/insurance/plan`) — Returns hardcoded stub data
3. **Tax Export** (`POST /courier/tax/export`) — Returns static message `"Tax report will be emailed to you shortly"` without actually doing anything

---

## ⚠️ Other Frontend Issues

### 1. Online/Offline Toggle (Dashboard)
- Toggle is **frontend-only** (`useState`)
- Backend is never notified when courier goes online/offline
- No location tracking starts/stops
- Other couriers/system can't see availability

### 2. Navigation After Actions
- Some screens navigate to hardcoded route names that may not exist in the navigator
- No error boundaries on screens

### 3. Withdrawal Error Handling (Wallet)
```tsx
// Line 79-83: Catch block simulates success instead of showing error
} catch {
  setTimeout(() => {
    setShowWithdraw(false);  // Hides error from user!
    setWithdrawAmount('');
  }, 1000);
}
```

### 4. Referral Code Always Hardcoded
- Share message always includes 'MIKE2026'
- Copy to clipboard always copies 'MIKE2026'
- Never replaced with actual user's referral code

---

## 📋 Fix Priority & Effort Estimate

### Priority 1: Dark Mode Fix (All Screens) — ~2 hours
Change all 27 courier screens from direct `colors` import to `useTheme()` hook.
This is the highest-impact fix — affects every single screen.

### Priority 2: Remove Mock Data Fallbacks — ~3 hours
Replace mock data fallbacks with proper empty states and error messages in 16 screens.
Users should never see fake data.

### Priority 3: Fix Hardcoded Values — ~1 hour
- Replace hardcoded referral code 'MIKE2026' with API data
- Replace hardcoded vehicle info with API data  
- Replace hardcoded insurance plans with API data
- Fix withdrawal error handling

### Priority 4: Online/Offline Status — ~2 hours
- Add backend endpoint for courier availability
- Send location updates when online
- Stop updates when offline

### Priority 5: Backend Stub Endpoints — ~1 hour
- Make insurance plans/current plan fetch from database
- Implement actual tax export functionality

---

## Summary

| Issue Type | Count | Severity |
|-----------|-------|----------|
| Dark mode broken | 27 screens | 🔴 Critical |
| Mock data shown to users | 16 screens | 🔴 Critical |
| Hardcoded values | 4 screens | ⚠️ High |
| Backend stubs | 3 endpoints | ⚠️ Medium |
| Missing online/offline sync | 1 feature | ⚠️ Medium |
| Error handling gaps | 3 screens | ⚠️ Medium |

**Bottom line:** The backend is solid (68+ endpoints all exist). The main problems are frontend-side:
1. Dark mode is completely broken across all screens
2. Too many screens show fake data instead of real data or proper empty states
3. A few critical values (referral code, vehicle info) are always hardcoded
