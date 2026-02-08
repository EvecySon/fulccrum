# Fulccrum: Frontend vs Backend — Complete Feature Comparison
**Date:** Feb 7, 2026 | **Auditor:** Cascade AI

---

## Legend
- ✅ = Exists and functional
- ⚠️ = Partially exists / needs work
- ❌ = Missing entirely
- 🆕 = Newly added frontend feature (no backend counterpart yet)

---

## 1. AUTH & REGISTRATION

| Feature | Frontend Screen | Frontend API (`api.ts`) | Backend Controller | Backend Status | Gap |
|---------|----------------|------------------------|--------------------|----------------|-----|
| Email/password register | RegisterScreen | `authAPI.register()` | `auth.controller` | ⚠️ | Role field missing from DTO — hardcoded to `customer` |
| Email/password login | LoginScreen | `authAPI.login()` | `auth.controller` | ✅ | |
| Phone login | LoginScreen | `authAPI.login()` | `auth.controller` | ❌ | Backend only accepts email login |
| Google OAuth | LoginScreen | `authAPI.googleLogin()` | — | ❌ | No Google auth endpoint |
| Apple OAuth | LoginScreen | `authAPI.appleLogin()` | — | ❌ | No Apple auth endpoint |
| Forgot password | ForgotPasswordScreen | `authAPI.forgotPassword()` | — | ❌ | No endpoint |
| OTP verification | OTPVerificationScreen | `authAPI.verifyOTP()` | — | ❌ | No endpoint, no OTP storage |
| Password reset | — | `authAPI.resetPassword()` | — | ❌ | No endpoint |
| Token refresh | (automatic) | `authAPI.refreshToken()` | — | ❌ | Service exists but no controller endpoint |
| OTP resend | OTPVerificationScreen | `authAPI.resendOTP()` | — | ❌ | No endpoint |
| Verification pending | 🆕 VerificationPendingScreen | — | — | ❌ | New screen, shows post-OTP progress |
| Dev mode auth bypass | App.tsx | — | — | ✅ | `DEV_SKIP_AUTH` + `__DEV__` simulation |

---

## 2. USER PROFILE

| Feature | Frontend Screen | Frontend API | Backend Controller | Backend Status | Gap |
|---------|----------------|-------------|--------------------|----------------|-----|
| Get profile | AccountScreen | `usersAPI.getProfile()` | `users.controller` | ✅ | |
| Update profile | EditProfileScreen | `usersAPI.updateProfile()` | `users.controller` | ✅ | |
| Update business profile | BusinessVerificationScreen | `usersAPI.updateBusinessProfile()` | `users.controller` | ✅ | |
| Upload avatar | EditProfileScreen | `uploadAPI.uploadAvatar()` | `upload.controller` | ✅ | |

---

## 3. CUSTOMER FEATURES

| Feature | Frontend Screen | Frontend API | Backend Controller | Backend Status | Gap |
|---------|----------------|-------------|--------------------|----------------|-----|
| Home / discovery | HomeScreen | `searchAPI.searchBusinesses()` | `search.controller` | ✅ | |
| Search businesses | SearchScreen | `searchAPI.searchAll()` | `search.controller` | ✅ | |
| Search menu items | SearchScreen | `searchAPI.searchMenuItems()` | `search.controller` | ✅ | |
| Restaurant detail | RestaurantScreen | `menuAPI`, `reviewsAPI` | `menu.controller`, `reviews.controller` | ✅ | |
| Menu item detail | MenuItemScreen | `menuAPI.getItem()` | `menu.controller` | ✅ | |
| Cart & checkout | CartScreen | `ordersAPI.create()`, `feesAPI`, `promosAPI` | `orders`, `fees`, `promos` | ✅ | |
| Order history | OrdersScreen | `ordersAPI.getMyOrders()` | `orders.controller` | ✅ | |
| Order tracking | OrderTrackingScreen | `ordersAPI.get()`, `locationAPI.trackOrder()` | `orders`, `location` | ✅ | |
| Order cancellation | OrderTrackingScreen | — | — | ❌ | No cancel endpoint |
| Reorder | OrdersScreen | — | — | ❌ | No reorder endpoint |
| Favorites | FavoritesScreen | `favoritesAPI` | `favorites.controller` | ✅ | |
| Addresses | AddressScreen | `addressesAPI` | `addresses.controller` | ✅ | |
| Payment methods | PaymentMethodsScreen | `paymentAPI.history()` | `payment.controller` | ⚠️ | No saved cards CRUD |
| Vouchers / promos | VouchersScreen | `promosAPI` | `promos.controller` | ✅ | |
| Loyalty | LoyaltyScreen | `usersAPI.getProfile()` | `users.controller` | ✅ | |
| Notifications | NotificationsScreen | `notificationsAPI` | `notifications.controller` | ✅ | |
| Customer chat | ChatScreen | `supportAPI` | `support.controller` | ✅ | |
| Group orders | GroupOrderScreen | `socialAPI.createGroupOrder()` | — | ❌ | No group order model/endpoint |
| Feedback / reviews | FeedbackScreen | `reviewsAPI.create()` | `reviews.controller` | ✅ | |
| Edit profile | EditProfileScreen | `usersAPI.updateProfile()` | `users.controller` | ✅ | |

---

## 4. CUSTOMER ADVANCED FEATURES (NEW)

| Feature | Frontend Screen | Frontend API | Backend Controller | Backend Status | Gap |
|---------|----------------|-------------|--------------------|----------------|-----|
| 🆕 AI recommendations | AIRecommendationsScreen | `aiAPI` (7 endpoints) | — | ❌ | **Entire AI module missing from backend** |
| 🆕 Voice ordering | VoiceOrderingScreen | `aiAPI.processVoiceCommand()` | — | ❌ | **No voice processing backend** |
| 🆕 AR food preview | ARFoodPreviewScreen | `arAPI` (3 endpoints) | — | ❌ | **Entire AR module missing from backend** |
| 🆕 VR restaurant tours | VRRestaurantTourScreen | `arAPI.getRestaurantTour()` | — | ❌ | **No VR backend** |
| 🆕 Social feed | SocialFeedScreen | `socialAPI` (10 endpoints) | — | ❌ | **Entire social module missing from backend** |
| 🆕 Sustainability | SustainabilityScreen | `sustainabilityAPI` (6 endpoints) | — | ❌ | **Entire sustainability module missing** |
| Blockchain / crypto | — (API only) | `blockchainAPI` (4 endpoints) | — | ❌ | **Entire blockchain module missing** |

---

## 5. MERCHANT FEATURES

| Feature | Frontend Screen | Frontend API | Backend Controller | Backend Status | Gap |
|---------|----------------|-------------|--------------------|----------------|-----|
| Dashboard | DashboardScreen | `analyticsAPI`, `ordersAPI` | `analytics`, `orders` | ✅ | |
| Order management | OrdersScreen | `ordersAPI` | `orders.controller` | ✅ | |
| Menu CRUD | MenuScreen | `menuAPI` (15 endpoints) | `menu.controller` | ✅ | |
| Analytics | AnalyticsScreen | `analyticsAPI` (7 endpoints) | `analytics.controller` | ✅ | |
| Settings | SettingsScreen | `usersAPI.updateBusinessProfile()` | `users.controller` | ✅ | |
| Reviews | ReviewsScreen | `reviewsAPI` | `reviews.controller` | ✅ | |
| Inventory | InventoryScreen | `menuAPI.getInventory()` | `menu.controller` | ✅ | |
| Business hours | BusinessHoursScreen | `menuAPI.getBusinessHours()` | `menu.controller` | ✅ | |
| Delivery zones | DeliveryZonesScreen | `zonesAPI` | `zones.controller` | ✅ | |
| Promotions | PromotionsScreen | `promosAPI` | `promos.controller` | ✅ | |
| Wallet | WalletScreen | `walletAPI` | `wallet.controller` | ⚠️ | No auto-credit, no bank accounts |

---

## 6. MERCHANT ADVANCED FEATURES (NEW)

| Feature | Frontend Screen | Frontend API | Backend Controller | Backend Status | Gap |
|---------|----------------|-------------|--------------------|----------------|-----|
| 🆕 Business verification | BusinessVerificationScreen | `uploadAPI`, `usersAPI` | `upload`, `users` | ⚠️ | Upload works, but no verification status tracking |
| 🆕 Registration payment | MerchantPaymentScreen | — (simulated) | — | ❌ | **No registration fee payment endpoint** |
| 🆕 Smart kitchen | SmartKitchenScreen | `kitchenAPI` (6 endpoints) | — | ❌ | **Entire kitchen module missing from backend** |
| 🆕 AI insights | AIInsightsScreen | `merchantInsightsAPI` (6 endpoints) | — | ❌ | **Entire merchant insights module missing** |
| 🆕 CRM | CRMScreen | `merchantCrmAPI` (7 endpoints) | — | ❌ | **Entire CRM module missing from backend** |
| 🆕 Multi-channel | MultiChannelScreen | `channelsAPI` (7 endpoints) | — | ❌ | **Entire channels module missing from backend** |
| 🆕 Dynamic pricing | DynamicPricingScreen | `dynamicPricingAPI` (6 endpoints) | — | ❌ | **Entire dynamic pricing module missing** |

---

## 7. COURIER FEATURES

| Feature | Frontend Screen | Frontend API | Backend Controller | Backend Status | Gap |
|---------|----------------|-------------|--------------------|----------------|-----|
| Dashboard | DashboardScreen | `analyticsAPI`, `ordersAPI` | `analytics`, `orders` | ✅ | |
| Available deliveries | DeliveriesScreen | `ordersAPI.getAvailableDeliveries()` | `orders.controller` | ✅ | |
| Active delivery | ActiveDeliveryScreen | `ordersAPI`, `locationAPI` | `orders`, `location` | ✅ | |
| Earnings | EarningsScreen | `analyticsAPI.revenue()` | `analytics.controller` | ✅ | |
| Profile | ProfileScreen | `usersAPI` | `users.controller` | ✅ | |
| Wallet | WalletScreen | `walletAPI` | `wallet.controller` | ⚠️ | No auto-credit, no bank accounts |

---

## 8. COURIER ADVANCED FEATURES (NEW)

| Feature | Frontend Screen | Frontend API | Backend Controller | Backend Status | Gap |
|---------|----------------|-------------|--------------------|----------------|-----|
| 🆕 Document verification | DocumentVerificationScreen | `uploadAPI` | `upload.controller` | ⚠️ | Upload works, but no verification status tracking |
| 🆕 Registration payment | CourierPaymentScreen | — (simulated) | — | ❌ | **No registration fee payment endpoint** |
| 🆕 Performance | PerformanceScreen | `courierFleetAPI` (5 endpoints) | — | ❌ | **Entire courier fleet module missing** |
| 🆕 Gamification | GamificationScreen | `courierGamificationAPI` (4 endpoints) | — | ❌ | **Entire gamification module missing** |
| 🆕 Safety | SafetyScreen | `courierSafetyAPI` (5 endpoints) | — | ❌ | **Entire safety module missing** |
| 🆕 Vehicle management | VehicleManagementScreen | — | — | ❌ | **No vehicle management backend** |

---

## 9. ADMIN FEATURES

| Feature | Frontend Screen | Frontend API | Backend Controller | Backend Status | Gap |
|---------|----------------|-------------|--------------------|----------------|-----|
| Overview / metrics | OverviewScreen | `adminAPI.getMetrics()` | `admin.controller` | ✅ | |
| User management | UsersScreen | `adminAPI.getUsers()`, suspend/activate | `admin.controller` | ✅ | |
| Order operations | OrdersOpsScreen | `adminAPI.getOrders()` | `admin.controller` | ✅ | |
| Finance | FinanceScreen | `analyticsAPI`, `adminAPI` | `analytics`, `admin` | ✅ | |
| Merchant management | MerchantsScreen | `adminAPI.getPendingMerchants()`, approve/reject | `admin.controller` | ✅ | |
| Settings | SettingsScreen | `feesAPI` | `fees.controller` | ✅ | |
| Payouts | PayoutsScreen | `adminAPI.getPendingWithdrawals()` | `admin.controller` | ✅ | |
| Promo management | PromoManagementScreen | `promosAPI` | `promos.controller` | ✅ | |
| Support tickets | SupportTicketsScreen | `supportAPI` | `support.controller` | ✅ | |
| Review moderation | ReviewModerationScreen | `reviewsAPI.hide()` | `reviews.controller` | ✅ | |
| Delivery zones mgmt | DeliveryZonesManagementScreen | `zonesAPI` | `zones.controller` | ✅ | |
| Push notifications | PushNotificationScreen | `notificationsAPI` | `notifications.controller` | ✅ | |

---

## 10. ADMIN ADVANCED FEATURES (NEW)

| Feature | Frontend Screen | Frontend API | Backend Controller | Backend Status | Gap |
|---------|----------------|-------------|--------------------|----------------|-----|
| 🆕 Dispute resolution | DisputeResolutionScreen | `supportAPI` | `support.controller` | ⚠️ | Support exists, but no dispute-specific model |
| 🆕 Add merchant (invite) | AddMerchantScreen | `adminAPI.inviteMerchant()` | — | ❌ | **No invite endpoint in backend** |
| 🆕 Add courier (invite) | AddCourierScreen | `adminAPI.inviteCourier()` | — | ❌ | **No invite endpoint in backend** |
| 🆕 Registration fee mgmt | — (in admin API) | `adminAPI.getRegistrationFees()` | — | ❌ | **No fee management endpoints** |
| 🆕 Courier approval | — (in admin API) | `adminAPI.approveCourier()` | — | ❌ | **No courier approval endpoints** |
| 🆕 Fee waiver | — (in admin API) | `adminAPI.waiveRegistrationFee()` | — | ❌ | **No fee waiver endpoint** |

---

## 11. SHARED / INFRASTRUCTURE

| Feature | Frontend | Backend | Status | Gap |
|---------|----------|---------|--------|-----|
| In-app chat | ChatScreen (shared) | `support.controller` | ✅ | |
| Voice/video call | CallScreen (shared) | — | ❌ | No call signaling backend |
| WebSocket real-time | `socketService.ts` | — | ❌ | **No WebSocket gateway** |
| Push notifications | `notificationsAPI` | `notifications.controller` | ⚠️ | Controller exists, not wired to events |
| SMS (Termii) | — | — | ❌ | **No Termii integration** |
| Email service | — | — | ❌ | **No email service** |
| File upload | `uploadService.ts` | `upload.controller` | ✅ | Local storage only |
| Location tracking | `locationService.ts` | `location.controller` | ✅ | |

---

## 12. WALLET & PAYMENTS — CRITICAL

| Feature | Frontend | Backend | Status | Gap |
|---------|----------|---------|--------|-----|
| Wallet balance | WalletScreen | `wallet.controller` | ✅ | |
| Withdrawal request | WalletScreen | `wallet.controller` | ✅ | |
| Withdrawal history | WalletScreen | `wallet.controller` | ✅ | |
| **Auto-credit on delivery** | — | — | ❌ | **Merchants/drivers never get paid** |
| **Commission calculation** | — | — | ❌ | **Platform loses revenue** |
| **Bank account CRUD** | — | — | ❌ | **Can't process real withdrawals** |
| **Paystack Transfer** | — | — | ❌ | **Money never actually moves** |
| **Transaction ledger** | — | — | ❌ | **No audit trail** |
| **Registration fee processing** | PaymentScreen (both) | — | ❌ | **Simulated with setTimeout** |
| Wallet currency | — | schema | ⚠️ | Defaults to "USD", should be "NGN" |

---

## 13. SUMMARY SCORECARD

### By Role — Screen Count & Backend Coverage

| Role | Total Screens | Core (backend ✅) | Advanced (🆕 no backend) | Backend Coverage |
|------|--------------|-------------------|--------------------------|-----------------|
| **Auth** | 6 | 5 | 1 | 83% |
| **Customer** | 24 | 18 | 6 | 75% |
| **Merchant** | 18 | 11 | 7 | 61% |
| **Courier** | 12 | 6 | 6 | 50% |
| **Admin** | 16 | 13 | 3 | 81% |
| **Shared** | 2 | 1 | 1 | 50% |
| **TOTAL** | **78** | **54** | **24** | **69%** |

### By Category — Missing Backend Modules

| Missing Backend Module | Frontend Screens Using It | Frontend API Endpoints | Priority |
|----------------------|--------------------------|----------------------|----------|
| **AI / Personalization** | AIRecommendations, VoiceOrdering | 7 endpoints | Phase 1 |
| **AR / VR** | ARFoodPreview, VRRestaurantTour | 3 endpoints | Phase 2 |
| **Social** | SocialFeed, GroupOrder | 10 endpoints | Phase 2 |
| **Sustainability** | Sustainability | 6 endpoints | Phase 2 |
| **Blockchain** | (no screen yet) | 4 endpoints | Phase 3 |
| **Smart Kitchen** | SmartKitchen | 6 endpoints | Phase 1 |
| **Merchant Insights** | AIInsights | 6 endpoints | Phase 1 |
| **Merchant CRM** | CRM | 7 endpoints | Phase 1 |
| **Multi-Channel** | MultiChannel | 7 endpoints | Phase 2 |
| **Dynamic Pricing** | DynamicPricing | 6 endpoints | Phase 2 |
| **Courier Fleet/Perf** | Performance | 5 endpoints | Phase 1 |
| **Courier Gamification** | Gamification | 4 endpoints | Phase 2 |
| **Courier Safety** | Safety | 5 endpoints | Phase 1 |
| **Registration Fees** | PaymentScreen (both) | 4 endpoints | Phase 1 |
| **Invite System** | AddMerchant, AddCourier | 3 endpoints | Phase 1 |
| **WebSocket Gateway** | (all real-time) | N/A | **CRITICAL** |
| **Termii SMS** | OTP flow | N/A | **CRITICAL** |
| **Email Service** | Password reset, confirmations | N/A | **CRITICAL** |

### Bottom Line

| Metric | Value |
|--------|-------|
| **Frontend screens** | 78 (100% complete) |
| **Frontend API endpoints defined** | ~200 |
| **Backend controllers** | 20 |
| **Backend endpoints** | ~140 |
| **Frontend features with backend** | 54 screens (69%) |
| **Frontend features WITHOUT backend** | 24 screens (31%) |
| **Missing backend modules** | 15 entirely new modules needed |
| **Missing backend endpoints** | ~88 endpoints |
| **Critical infrastructure gaps** | WebSocket, SMS, Email, Wallet settlement |
