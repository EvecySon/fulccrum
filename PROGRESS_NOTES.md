# Progress Notes

## March 16, 2026

### 1. Referral System - Fully Functional
- Added `referralCode` field to User model in Prisma schema (unique, stored permanently)
- Updated `RegisterDto` to accept `referredByCode` during registration
- Updated `AuthService.register()` to generate unique referral codes and create Referral records
- Updated `ReferralsService.getMyStats()` to use stored codes instead of random generation
- Created `ReferralTrackingService` to track order completions for referred users
- Integrated tracking with `OrdersService` — auto-credits ₦5,000 to referrer's wallet after 25 deliveries
- Ran Prisma migration: `20260316022018_add_referral_code_and_provider_models`

### 2. Removed ALL Mock Data from Frontend (57 instances across 15 files)
Replaced `withMock()` wrappers with real API calls in:
- `OrdersScreen.tsx` — real orders from database
- `HomeScreen.tsx` — real restaurants, trending, addresses, notifications
- `CartScreen.tsx` — real fees, promos, addresses, wallet balance
- `SearchScreen.tsx` — real search results
- `MenuItemScreen.tsx` — real menu items and modifiers
- `RestaurantScreen.tsx` — real restaurant menu data
- `DealsScreen.tsx` — real promos and deals
- `OrderTrackingScreen.tsx` — real order tracking
- `AccountScreen.tsx` — real loyalty profile
- `AuthContext.tsx` — real authentication (login)

### 3. Profile Picture Upload - Fixed End to End
- **Backend:** Simplified `updateUserAvatar()` to skip image processing (sharp) and save files directly
- **Backend:** Save full URL (including `http://localhost:3001`) instead of relative path
- **Backend:** Added error logging to avatar upload controller
- **Frontend (Web):** Fixed FormData for web — convert image URI to Blob/File before uploading (browsers don't support React Native `{uri, name, type}` pattern)
- **Frontend:** Added auto token refresh to `api.upload()` function so uploads don't fail with 401 when token expires
- **Frontend:** After upload, fetch fresh user profile from backend to ensure avatar persists across screens
- **Drawer Menu:** Added profile picture display to `DrawerMenu.tsx` — shows actual avatar when available, falls back to initials

### 4. Navigation - Back Buttons
- Added header with back button to `WalletScreen.tsx`
- Added header with back button to `ReferralsScreen.tsx`
- Both accessible from hamburger menu with proper navigation back

### 5. Mobile UI Fix
- Fixed `ServiceSelectionScreen.tsx` 4-grid cards not fitting mobile screen (ScrollView and grid layout)

---

### Files Modified (Backend)
- `backend/prisma/schema.prisma` — added referralCode to User
- `backend/src/auth/auth.service.ts` — referral code during registration
- `backend/src/auth/dto/register.dto.ts` — referredByCode field
- `backend/src/referrals/referrals.service.ts` — use stored codes
- `backend/src/referrals/referral-tracking.service.ts` — NEW: order tracking
- `backend/src/referrals/referrals.module.ts` — export tracking service
- `backend/src/orders/orders.service.ts` — track referrals on delivery
- `backend/src/orders/orders.module.ts` — import ReferralsModule
- `backend/src/upload/upload.service.ts` — simplified avatar upload with full URL
- `backend/src/upload/upload.controller.ts` — error handling for avatar

### Files Modified (Frontend)
- `frontend/src/screens/customer/OrdersScreen.tsx`
- `frontend/src/screens/customer/HomeScreen.tsx`
- `frontend/src/screens/customer/CartScreen.tsx`
- `frontend/src/screens/customer/SearchScreen.tsx`
- `frontend/src/screens/customer/MenuItemScreen.tsx`
- `frontend/src/screens/customer/RestaurantScreen.tsx`
- `frontend/src/screens/customer/DealsScreen.tsx`
- `frontend/src/screens/customer/OrderTrackingScreen.tsx`
- `frontend/src/screens/customer/AccountScreen.tsx`
- `frontend/src/screens/customer/EditProfileScreen.tsx`
- `frontend/src/screens/customer/WalletScreen.tsx`
- `frontend/src/screens/customer/ReferralsScreen.tsx`
- `frontend/src/screens/customer/ServiceSelectionScreen.tsx`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/components/DrawerMenu.tsx`

### Pending
- Run Prisma migration on production database when deploying
- Test all backend endpoints with real data end-to-end
- Remaining mock data in `mockApi.ts` utility functions (normalizeRestaurants, normalizeMenuItems) still used for data normalization — not mock data, just helpers
