# Backend Gaps — For Teammate Implementation

> Generated from frontend ↔ backend audit on Feb 7, 2026.
> Frontend screens are complete and reference these API endpoints/features.

---

## 1. Auth Module — CRITICAL GAPS

The auth controller only has `POST /auth/register` and `POST /auth/login`.

| # | Missing Endpoint / Feature | Priority | Notes |
|---|---------------------------|----------|-------|
| 1.1 | `POST /auth/forgot-password` | **HIGH** | Accept email or phone, send OTP via Termii (SMS) or email. Frontend `ForgotPasswordScreen` calls this. |
| 1.2 | `POST /auth/verify-otp` | **HIGH** | Verify 6-digit OTP code. Frontend `OTPVerificationScreen` sends `{ contact, code }`. |
| 1.3 | `POST /auth/reset-password` | **HIGH** | Accept `{ token, newPassword }` after OTP verification. |
| 1.4 | `POST /auth/refresh-token` | **HIGH** | `RefreshTokenService` exists but **no controller endpoint** exposes it. Frontend needs `POST /auth/refresh-token` with `{ refreshToken }` → returns new `accessToken`. |
| 1.5 | `POST /auth/logout` | MEDIUM | Revoke refresh token server-side. |
| 1.6 | `GET /auth/me` (or `GET /users/me`) | **HIGH** | Return current user profile from JWT. Frontend `AuthContext.checkAuth()` needs this to restore sessions. |
| 1.7 | Role in RegisterDto | **HIGH** | `RegisterDto` has no `role` field — it's hardcoded to `'customer'`. Frontend sends `role` (customer / business_owner / driver). Add `@IsOptional() @IsEnum() role` to DTO and use it in `auth.service.register()`. |
| 1.8 | Phone-based login | MEDIUM | Frontend login supports email OR phone. Backend `LoginDto` only accepts email. Add phone login option. |

---

## 2. User Profile Module — MISSING ENTIRELY

No `/users` controller exists. Frontend needs:

| # | Missing Endpoint | Priority | Notes |
|---|-----------------|----------|-------|
| 2.1 | `GET /users/me` | **HIGH** | Return full user profile (with CustomerProfile / DriverProfile / BusinessProfile based on role). |
| 2.2 | `PUT /users/me` | **HIGH** | Update profile fields (name, phone, avatar). |
| 2.3 | `PUT /users/me/password` | MEDIUM | Change password (requires current password). |
| 2.4 | `PUT /users/me/avatar` | MEDIUM | Upload/update avatar URL. |
| 2.5 | `GET /users/me/addresses` | MEDIUM | CRUD for saved delivery addresses (Address model exists in schema). |
| 2.6 | `POST /users/me/addresses` | MEDIUM | Create new address. |
| 2.7 | `DELETE /users/me/addresses/:id` | LOW | Delete saved address. |

---

## 3. Orders Module — Minor Gaps

| # | Missing Feature | Priority | Notes |
|---|----------------|----------|-------|
| 3.1 | Order cancellation endpoint | MEDIUM | `PATCH /orders/:id/cancel` — frontend OrderTracking has cancel button. |
| 3.2 | Reorder endpoint | LOW | `POST /orders/:id/reorder` — clone a previous order. Frontend OrdersScreen has "Reorder" button. |
| 3.3 | Order rating after delivery | MEDIUM | `POST /orders/:id/rate` — rate order + driver. Currently reviews are separate but order-level quick rating is needed. |

---

## 4. Payment Module — Minor Gaps

| # | Missing Feature | Priority | Notes |
|---|----------------|----------|-------|
| 4.1 | Wallet top-up via Paystack | **HIGH** | Frontend PaymentMethodsScreen has "Top Up" button. Need `POST /payment/topup` → initialize Paystack for wallet funding. |
| 4.2 | Saved cards list | MEDIUM | `GET /payment/cards` — list user's saved Paystack authorization tokens. |
| 4.3 | Delete saved card | LOW | `DELETE /payment/cards/:authorizationCode`. |

---

## 5. Fees Module — Verify

| # | Item | Priority | Notes |
|---|------|----------|-------|
| 5.1 | `POST /fees/calculate` | MEDIUM | Verify this returns `{ deliveryFee, serviceFee, estimatedTime }`. Frontend CartScreen uses these values. |

---

## 6. Socket.io / Real-time — MISSING ENTIRELY

No WebSocket gateway exists in the backend.

| # | Missing Feature | Priority | Notes |
|---|----------------|----------|-------|
| 6.1 | WebSocket Gateway with JWT auth | **HIGH** | NestJS `@WebSocketGateway()` with `handleConnection` validating JWT token. |
| 6.2 | Order room management | **HIGH** | `join:order` / `leave:order` events. Emit `order:status_updated` when order status changes. |
| 6.3 | Driver location broadcast | **HIGH** | Receive driver location updates via socket, broadcast to customers tracking orders. |
| 6.4 | New order notification to merchant | **HIGH** | Emit `order:new` to merchant when a new order is placed for their business. |
| 6.5 | Delivery assignment notification | MEDIUM | Emit `delivery:assigned` to courier when assigned a delivery. |
| 6.6 | Chat messaging | MEDIUM | Real-time `chat:message` / `chat:send` for support ticket conversations. |
| 6.7 | Push notification relay | LOW | Emit `notification:new` for in-app notification badge updates. |

---

## 7. Termii SMS Integration — MISSING

| # | Missing Feature | Priority | Notes |
|---|----------------|----------|-------|
| 7.1 | Termii service for OTP sending | **HIGH** | Send 6-digit OTP via SMS for phone verification, password reset. |
| 7.2 | OTP storage & validation | **HIGH** | Store OTP with expiry (5 min), validate on verify endpoint. Can use Redis or DB table. |
| 7.3 | SMS notification service | MEDIUM | Order status SMS to customers (placed, picked up, delivered). |

---

## 8. Email Service — MISSING

| # | Missing Feature | Priority | Notes |
|---|----------------|----------|-------|
| 8.1 | Email service (Nodemailer / SendGrid) | MEDIUM | Password reset emails, order confirmations, welcome emails. |
| 8.2 | Email templates | LOW | HTML templates for transactional emails. |

---

## 9. Admin Module — Gaps

| # | Missing Feature | Priority | Notes |
|---|----------------|----------|-------|
| 9.1 | Admin promo CRUD | MEDIUM | Admin controller doesn't expose promo management. Frontend `PromoManagementScreen` needs admin-level promo endpoints (already in promos controller but needs admin role guard). |
| 9.2 | Admin review moderation | MEDIUM | `GET /admin/reviews/flagged` — list flagged reviews. Frontend `ReviewModerationScreen` needs this. The reviews controller has hide/unhide but no admin-specific flagged list. |
| 9.3 | Admin support ticket assignment | MEDIUM | Verify `PATCH /support/tickets/:id/assign` checks admin role. |
| 9.4 | Admin push notification broadcast | MEDIUM | `POST /admin/notifications/broadcast` — send push to audience segments. Frontend `PushNotificationScreen` needs this. |
| 9.5 | Platform settings CRUD | LOW | `GET/PUT /admin/settings` — PlatformSettings model exists but no controller. Frontend AdminSettingsScreen needs this. |
| 9.6 | Admin dashboard real-time stats | LOW | WebSocket events for live order count, active couriers, etc. |

---

## 10. Upload Module — Verify

| # | Item | Priority | Notes |
|---|------|----------|-------|
| 10.1 | Verify file storage backend | MEDIUM | Check if upload controller stores to local disk or cloud (S3/Cloudinary). For production, need cloud storage. |
| 10.2 | Image resize/optimization | LOW | Resize uploaded images for thumbnails. |

---

## 11. Cron Jobs / Background Tasks

| # | Missing Feature | Priority | Notes |
|---|----------------|----------|-------|
| 11.1 | Expired refresh token cleanup | LOW | `RefreshTokenService.cleanupExpiredTokens()` exists but no cron trigger. |
| 11.2 | Expired promo deactivation | LOW | Auto-deactivate promos past `validUntil`. |
| 11.3 | Stale order timeout | MEDIUM | Auto-cancel orders stuck in `pending` for > 30 min. |
| 11.4 | Driver offline timeout | LOW | Mark drivers offline if no location update in 10 min. |

---

## 12. Security & Middleware

| # | Missing Feature | Priority | Notes |
|---|----------------|----------|-------|
| 12.1 | Role-based guards | **HIGH** | Many endpoints need `@Roles('admin')` or `@Roles('business_owner')` guards. Currently only `JwtAuthGuard` exists. |
| 12.2 | Rate limiting | MEDIUM | Protect auth endpoints from brute force (especially login, OTP). |
| 12.3 | Request validation pipe (global) | MEDIUM | Ensure `ValidationPipe` is globally enabled for all DTOs. |
| 12.4 | CORS configuration | MEDIUM | Configure for mobile app + web admin panel origins. |

---

## 13. Wallet & Payment Settlement — CRITICAL GAPS

The wallet module has balance/withdrawal endpoints but **no automatic crediting logic**.

| # | Missing Feature | Priority | Notes |
|---|----------------|----------|-------|
| 13.1 | **Auto-credit wallets on order completion** | **HIGH** | When order status → `delivered`, calculate splits and credit merchant + courier `DigitalWallet.balance` instantly. Trigger via order status update hook. |
| 13.2 | **Commission calculation service** | **HIGH** | Configurable platform commission (e.g. 10% from merchant, 15% from courier delivery fee). Store rates in `PlatformSettings`. Split: `merchantCredit = subtotal - (subtotal × merchantCommission)`, `courierCredit = deliveryFee - (deliveryFee × courierCommission)`. |
| 13.3 | **Transaction ledger** | **HIGH** | Record every wallet credit/debit with type enum: `order_earning`, `delivery_earning`, `tip`, `bonus`, `withdrawal`, `refund`, `platform_fee`. Link to orderId. This is needed for the wallet history UI. |
| 13.4 | **Paystack Transfer API integration** | **HIGH** | Execute actual bank transfers when withdrawals are approved. Use Paystack's `POST /transfer` endpoint. Requires merchant/courier to have saved bank account (recipient code). |
| 13.5 | **Bank account management** | **HIGH** | `POST /wallet/bank-accounts` — save bank account (bank code, account number, verify via Paystack). `GET /wallet/bank-accounts` — list saved accounts. `DELETE /wallet/bank-accounts/:id`. |
| 13.6 | **Auto-approve small withdrawals** | MEDIUM | If withdrawal amount ≤ configurable threshold (e.g. ₦50,000), skip admin approval and process immediately via Paystack Transfer. |
| 13.7 | **Minimum withdrawal enforcement** | MEDIUM | Validate minimum amount (e.g. ₦1,000) in withdrawal request DTO. |
| 13.8 | **Tip handling** | MEDIUM | Customer tips added post-delivery go 100% to courier wallet. |
| 13.9 | **Refund → wallet debit** | MEDIUM | When admin issues refund, debit merchant wallet if already credited. |

### Expected Settlement Flow:
```
Order delivered
  → OrdersService.updateStatus('delivered')
    → WalletService.settleOrder(orderId)
      → Calculate: merchantAmount = subtotal × (1 - platformCommission)
      → Calculate: courierAmount = deliveryFee × (1 - courierCommission)
      → Credit merchant DigitalWallet
      → Credit courier DigitalWallet
      → Create 2 transaction records (type: 'order_earning', 'delivery_earning')
      → Send push notifications to both
```

### Expected Withdrawal Flow:
```
Merchant/Courier requests withdrawal
  → POST /wallet/withdraw/request { amount, bankAccountId }
  → Validate: balance ≥ amount, amount ≥ minimum
  → Debit wallet balance immediately (freeze amount)
  → If amount ≤ autoApproveThreshold:
      → Auto-approve → Paystack Transfer → status: 'completed'
  → Else:
      → status: 'pending' → Admin reviews in Payouts screen
      → Admin approves → Paystack Transfer → status: 'completed'
      → Admin rejects → Refund frozen amount back to wallet
```

---

## Summary — Priority Breakdown

| Priority | Count | Key Items |
|----------|-------|-----------|
| **HIGH** | 15 | Auth flows (forgot password, OTP, refresh token, role in register), User profile CRUD, WebSocket gateway, Termii SMS, Role guards, Wallet top-up |
| **MEDIUM** | 16 | Phone login, Order cancel/rate, Email service, Admin features, Cron jobs, Rate limiting |
| **LOW** | 8 | Address CRUD, Saved cards, Email templates, Image optimization, Cleanup crons |

### Recommended Implementation Order:
1. **Auth gaps** (1.1–1.8) — blocks all frontend testing
2. **User profile** (2.1–2.2) — needed for session restore
3. **Role guards** (12.1) — security critical
4. **WebSocket gateway** (6.1–6.4) — needed for real-time features
5. **Termii SMS** (7.1–7.2) — needed for OTP flow
6. **Wallet top-up** (4.1) — needed for payment flow
7. Everything else in priority order
