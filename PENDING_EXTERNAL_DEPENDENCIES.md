# Pending Features - External Dependencies & Business Registration

**Last Updated:** March 11, 2026  
**Status:** Awaiting Business Registration & Third-Party API Access

---

## 📋 OVERVIEW

This document tracks all features that are **partially implemented** or **blocked** pending:
1. **Business Registration** (CAC, TIN, etc.)
2. **Third-Party API Keys** (Paystack, Termii, etc.)
3. **Production Credentials** (Firebase, Google Maps, etc.)

**Current Backend Completion:** ~95% Core MVP  
**Blocking Items:** 12 features requiring external services

---

## 🚨 CRITICAL - PAYMENT SYSTEM (Partially Implemented)

### Status: 70% Complete ✅ (Backend Ready, Needs Production Keys)

**What's Implemented:**
- ✅ Paystack integration code (payment.service.ts)
- ✅ Payment initialization endpoint
- ✅ Payment verification endpoint
- ✅ Webhook handler for payment callbacks
- ✅ Wallet top-up flow
- ✅ Automatic wallet crediting
- ✅ Order payment flow (card + wallet)
- ✅ Refund processing logic

**What's Blocked:**
- ❌ **Paystack Production API Keys** - Requires verified business
- ❌ **Paystack Transfers API** - For merchant/driver withdrawals
- ❌ **Bank Transfer Integration** - Requires business bank account

**Required for Production:**
```env
# Needs Business Registration
PAYSTACK_SECRET_KEY=sk_live_xxxxx  # Currently using test keys
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_TRANSFER_RECIPIENT_CODE=xxxxx  # For withdrawals
```

**Business Requirements:**
1. ✅ CAC Registration Certificate
2. ✅ Business Bank Account (for settlement)
3. ✅ TIN (Tax Identification Number)
4. ✅ Director's ID/BVN

**Impact:** Cannot process real payments or withdrawals until Paystack is verified

**Files:**
- `backend/src/payment/payment.service.ts`
- `backend/src/payment/payment.controller.ts`
- `backend/src/wallet/wallet.service.ts`

---

## 📱 SMS & OTP SYSTEM (Partially Implemented)

### Status: 60% Complete ✅ (Code Ready, Needs API Key)

**What's Implemented:**
- ✅ Termii SMS service (termii.service.ts)
- ✅ OTP generation logic
- ✅ Phone verification endpoints
- ✅ Order notification SMS templates
- ✅ Password reset via SMS

**What's Blocked:**
- ❌ **Termii API Key** - Requires business verification
- ❌ **Sender ID Registration** - Needs CAC documents

**Required for Production:**
```env
# Needs Business Registration
TERMII_API_KEY=xxxxx  # Currently missing
TERMII_SENDER_ID=Fulccrum  # Needs approval from Termii
```

**Business Requirements:**
1. ✅ CAC Registration
2. ✅ Business Address
3. ✅ Contact Person Details

**Impact:** 
- Cannot send SMS OTP for phone verification
- Cannot send order status SMS notifications
- Users must rely on email only

**Files:**
- `backend/src/messaging/termii.service.ts`
- `backend/src/auth/auth.service.ts` (OTP logic)

---

## 🔔 PUSH NOTIFICATIONS (Partially Implemented)

### Status: 80% Complete ✅ (Backend Ready, Needs Production Config)

**What's Implemented:**
- ✅ Firebase Admin SDK integration
- ✅ Push notification service
- ✅ Device token management
- ✅ Notification templates
- ✅ Order status notifications
- ✅ Real-time notification delivery

**What's Blocked:**
- ❌ **Firebase Production Project** - Using test project
- ❌ **APNs Certificate** (iOS) - Requires Apple Developer Account
- ❌ **Google Services JSON** (Android) - Needs production Firebase

**Required for Production:**
```env
# Needs Production Firebase Project
FIREBASE_PROJECT_ID=fulccrum-prod
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@fulccrum-prod.iam.gserviceaccount.com
```

**Business Requirements:**
1. ✅ Apple Developer Account ($99/year) - For iOS push
2. ✅ Google Play Console Account ($25 one-time) - For Android
3. ✅ Production Firebase Project

**Impact:**
- Push notifications work in dev but may not scale in production
- iOS push requires APNs certificate

**Files:**
- `backend/src/notifications/firebase.service.ts`
- `backend/src/notifications/notifications.service.ts`

---

## 🗺️ MAPS & LOCATION (Partially Implemented)

### Status: 50% Complete ✅ (Backend Ready, Needs API Keys)

**What's Implemented:**
- ✅ Location tracking service
- ✅ GPS coordinate storage
- ✅ Nearby driver search (Haversine formula)
- ✅ Order tracking endpoints
- ✅ Driver location updates

**What's Blocked:**
- ❌ **Google Maps API Key** - For address autocomplete, geocoding
- ❌ **Mapbox API Key** - Alternative for maps rendering
- ❌ **Distance Matrix API** - For accurate delivery time estimates

**Required for Production:**
```env
# Needs Google Cloud Account + Billing
GOOGLE_MAPS_API_KEY=xxxxx
GOOGLE_PLACES_API_KEY=xxxxx
GOOGLE_DISTANCE_MATRIX_API_KEY=xxxxx

# Alternative: Mapbox
MAPBOX_ACCESS_TOKEN=xxxxx
```

**Business Requirements:**
1. ✅ Google Cloud Account
2. ✅ Credit Card for billing
3. ✅ Enable Maps APIs

**Impact:**
- Cannot show maps in frontend
- Cannot autocomplete addresses
- Cannot calculate accurate delivery times
- Manual coordinate entry only

**Files:**
- `backend/src/location/location.service.ts`
- `frontend/src/components/MapView.tsx` (needs API key)

---

## 💳 BANK ACCOUNT VERIFICATION (Not Implemented)

### Status: 0% Complete ❌ (Needs Paystack Account Verification API)

**What's Needed:**
- ❌ Paystack Account Verification API
- ❌ Bank account validation
- ❌ BVN verification (for merchants/drivers)

**Required for Production:**
```env
PAYSTACK_SECRET_KEY=sk_live_xxxxx  # Same as payment
```

**Business Requirements:**
1. ✅ Verified Paystack Business Account

**Impact:**
- Cannot verify merchant/driver bank accounts before payouts
- Risk of failed withdrawals to invalid accounts

**Endpoints to Build:**
```
POST /wallet/bank-accounts/verify
- Verify bank account number + bank code
- Returns account name for confirmation

POST /wallet/bvn/verify
- Verify BVN for KYC compliance
```

**Files to Create:**
- `backend/src/wallet/bank-verification.service.ts`

---

## 📧 EMAIL SERVICE (Partially Implemented)

### Status: 70% Complete ✅ (Using Gmail, Needs Production SMTP)

**What's Implemented:**
- ✅ Email service with Nodemailer
- ✅ Password reset emails
- ✅ Order confirmation emails
- ✅ Welcome emails

**What's Blocked:**
- ❌ **Production SMTP** (SendGrid/Mailgun) - Needs business email
- ❌ **Custom Domain Email** - Needs domain + business verification

**Current Setup (Dev Only):**
```env
# Using Gmail (not scalable)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=app-password
```

**Required for Production:**
```env
# Option 1: SendGrid (Recommended)
SENDGRID_API_KEY=xxxxx
SENDGRID_FROM_EMAIL=noreply@fulccrum.com

# Option 2: Mailgun
MAILGUN_API_KEY=xxxxx
MAILGUN_DOMAIN=fulccrum.com
```

**Business Requirements:**
1. ✅ Custom Domain (fulccrum.com)
2. ✅ Domain Verification (DNS records)
3. ✅ Business Email Address

**Impact:**
- Gmail has sending limits (500/day)
- May be flagged as spam
- Cannot scale to thousands of users

**Files:**
- `backend/src/common/services/email.service.ts`

---

## 🏦 WITHDRAWAL SYSTEM (Partially Implemented)

### Status: 40% Complete ✅ (DB Ready, Needs Paystack Transfers)

**What's Implemented:**
- ✅ Withdrawal request creation
- ✅ OTP verification for withdrawals
- ✅ Admin approval workflow
- ✅ Bank account CRUD

**What's Blocked:**
- ❌ **Paystack Transfer API** - Actual bank transfers
- ❌ **Transfer Recipient Creation** - Paystack recipient codes
- ❌ **Transfer Webhook** - Confirm successful transfers

**Required for Production:**
```env
PAYSTACK_SECRET_KEY=sk_live_xxxxx
```

**Business Requirements:**
1. ✅ Verified Paystack Business Account
2. ✅ Business Bank Account (for settlement)
3. ✅ Transfer API Access (requires KYC)

**Impact:**
- Withdrawals recorded in DB but not executed
- Merchants/drivers cannot receive money
- Manual bank transfers required

**Endpoints to Complete:**
```
POST /admin/withdrawals/:id/process
- Actually transfer money via Paystack
- Update withdrawal status to 'completed'
```

**Files:**
- `backend/src/wallet/wallet.service.ts` (processWithdrawal method)

---

## 📄 DOCUMENT VERIFICATION (Partially Implemented)

### Status: 30% Complete ✅ (Upload Works, Needs OCR/Verification)

**What's Implemented:**
- ✅ Document upload to cloud storage
- ✅ Document model in database
- ✅ Admin document review UI
- ✅ Document status tracking

**What's Blocked:**
- ❌ **OCR API** (Google Vision/AWS Textract) - Extract text from IDs
- ❌ **ID Verification API** (Smile Identity/Youverify) - Verify Nigerian IDs
- ❌ **Automated Document Validation**

**Required for Production:**
```env
# Option 1: Google Cloud Vision
GOOGLE_CLOUD_VISION_API_KEY=xxxxx

# Option 2: Smile Identity (Nigerian KYC)
SMILE_IDENTITY_API_KEY=xxxxx
SMILE_IDENTITY_PARTNER_ID=xxxxx

# Option 3: Youverify (Nigerian)
YOUVERIFY_API_KEY=xxxxx
```

**Business Requirements:**
1. ✅ Google Cloud Account (for Vision API)
2. ✅ Smile Identity Business Account
3. ✅ CAC Registration

**Impact:**
- Manual document verification only
- Slow merchant/driver onboarding
- Risk of fake documents

**Files:**
- `backend/src/documents/documents.service.ts`
- `backend/src/admin/admin.service.ts`

---

## 🔐 OAUTH / SOCIAL LOGIN (Not Implemented)

### Status: 0% Complete ❌ (Needs OAuth App Registration)

**What's Needed:**
- ❌ Google OAuth integration
- ❌ Apple Sign In integration
- ❌ Facebook Login integration

**Required for Production:**
```env
# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

# Apple Sign In
APPLE_CLIENT_ID=com.fulccrum.app
APPLE_TEAM_ID=xxxxx
APPLE_KEY_ID=xxxxx
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Facebook Login
FACEBOOK_APP_ID=xxxxx
FACEBOOK_APP_SECRET=xxxxx
```

**Business Requirements:**
1. ✅ Google Cloud Console Project
2. ✅ Apple Developer Account ($99/year)
3. ✅ Facebook Developer Account
4. ✅ Privacy Policy URL (required by all)
5. ✅ Terms of Service URL

**Impact:**
- Users must use email/password only
- Lower conversion rate (social login is easier)

**Endpoints to Build:**
```
POST /auth/google
POST /auth/apple
POST /auth/facebook
```

**Files to Create:**
- `backend/src/auth/strategies/google.strategy.ts`
- `backend/src/auth/strategies/apple.strategy.ts`

---

## 📊 ANALYTICS & MONITORING (Partially Implemented)

### Status: 50% Complete ✅ (Basic Analytics, Needs Production Tools)

**What's Implemented:**
- ✅ Basic analytics service
- ✅ Dashboard stats endpoints
- ✅ Revenue tracking
- ✅ Order metrics

**What's Blocked:**
- ❌ **Sentry** (Error Tracking) - Needs production account
- ❌ **Google Analytics** - Needs tracking ID
- ❌ **Mixpanel/Amplitude** - User behavior analytics

**Required for Production:**
```env
# Sentry (Error Tracking)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Google Analytics
GA_TRACKING_ID=G-XXXXXXXXXX

# Mixpanel (Optional)
MIXPANEL_TOKEN=xxxxx
```

**Business Requirements:**
1. ✅ Sentry Account (free tier available)
2. ✅ Google Analytics Account
3. ✅ Domain ownership verification

**Impact:**
- Cannot track errors in production
- No user behavior insights
- Difficult to debug production issues

**Files:**
- `backend/src/analytics/analytics.service.ts`

---

## 🌐 DOMAIN & SSL (Not Configured)

### Status: 0% Complete ❌ (Needs Domain Purchase)

**What's Needed:**
- ❌ Domain purchase (fulccrum.com or similar)
- ❌ SSL certificate
- ❌ DNS configuration
- ❌ Email domain setup

**Required for Production:**
```
Domain: fulccrum.com (or .ng for Nigerian)
SSL: Let's Encrypt (free) or Cloudflare
DNS: Cloudflare/Route53
```

**Business Requirements:**
1. ✅ Domain registrar account (Namecheap, GoDaddy, etc.)
2. ✅ Payment for domain (~$10-15/year)

**Impact:**
- Cannot deploy to production
- Cannot use custom email addresses
- Cannot enable HTTPS

---

## 💼 BUSINESS REGISTRATION REQUIREMENTS

### Documents Needed for Third-Party Services

**For Paystack (Payment Gateway):**
- ✅ CAC Registration Certificate
- ✅ Business Bank Account Statement
- ✅ Director's Valid ID (NIN/Passport/Driver's License)
- ✅ Director's BVN
- ✅ TIN Certificate
- ✅ Utility Bill (Business Address)

**For Termii (SMS Service):**
- ✅ CAC Registration Certificate
- ✅ Business Address
- ✅ Contact Person Details
- ✅ Sender ID Application Form

**For Google Cloud (Maps, Vision, etc.):**
- ✅ Business Email
- ✅ Credit Card for billing
- ✅ Business Address

**For Apple Developer:**
- ✅ D-U-N-S Number (for business account)
- ✅ Business Registration Documents
- ✅ $99/year fee

---

## 📅 IMPLEMENTATION TIMELINE

### Phase 1: Business Registration (Week 1-2)
- [ ] Register business with CAC
- [ ] Open business bank account
- [ ] Obtain TIN certificate
- [ ] Get utility bill for business address

### Phase 2: Payment Setup (Week 3)
- [ ] Apply for Paystack business account
- [ ] Submit KYC documents
- [ ] Wait for verification (3-5 business days)
- [ ] Get production API keys
- [ ] Test live payments

### Phase 3: Communication Setup (Week 4)
- [ ] Apply for Termii account
- [ ] Submit Sender ID application
- [ ] Purchase domain (fulccrum.com)
- [ ] Setup email service (SendGrid)
- [ ] Configure DNS records

### Phase 4: Mobile App Setup (Week 5)
- [ ] Register Apple Developer Account
- [ ] Register Google Play Console
- [ ] Setup Firebase Production Project
- [ ] Configure push notifications
- [ ] Submit apps for review

### Phase 5: Additional Services (Week 6)
- [ ] Setup Google Cloud (Maps, Vision)
- [ ] Configure OAuth providers
- [ ] Setup error tracking (Sentry)
- [ ] Configure analytics

---

## 💰 ESTIMATED COSTS

### One-Time Costs:
- CAC Registration: ₦10,000 - ₦50,000
- Domain (.com): $10-15/year (~₦15,000)
- Apple Developer: $99/year (~₦150,000)
- Google Play: $25 one-time (~₦38,000)

### Monthly Costs (Estimated):
- Paystack: 1.5% + ₦100 per transaction
- Termii SMS: ₦2-4 per SMS
- SendGrid: Free (up to 100 emails/day) or $15/month
- Firebase: Free tier (sufficient for start)
- Google Maps: $200 free credit/month, then pay-as-you-go
- Sentry: Free tier (sufficient for start)

### Total Initial Investment: ~₦250,000 - ₦350,000

---

## 🎯 PRIORITY ORDER

### P0 - Cannot Launch Without:
1. **Paystack Production Keys** - For real payments
2. **Domain + SSL** - For production deployment
3. **Firebase Production** - For push notifications

### P1 - Launch with Workarounds:
4. **Termii SMS** - Can use email-only initially
5. **Google Maps** - Can use manual address entry
6. **SendGrid Email** - Can use Gmail initially

### P2 - Post-Launch:
7. **OAuth Providers** - Nice to have
8. **Document Verification APIs** - Manual review initially
9. **Advanced Analytics** - Basic analytics sufficient

---

## 📝 NOTES

**What Works Without External APIs:**
- ✅ User registration/login (email/password)
- ✅ Order creation and tracking
- ✅ Wallet system (internal)
- ✅ Admin dashboard
- ✅ Real-time updates (WebSocket)
- ✅ Location tracking (GPS only)
- ✅ Reviews and ratings
- ✅ Menu management
- ✅ Basic analytics

**What's Blocked:**
- ❌ Real payment processing
- ❌ SMS notifications
- ❌ Bank withdrawals
- ❌ Maps/autocomplete
- ❌ Social login
- ❌ Production deployment

---

## 🚀 NEXT STEPS

1. **Start business registration process** (CAC)
2. **Apply for Paystack account** (can start before CAC completes)
3. **Purchase domain** (can do immediately)
4. **Setup Firebase production project** (can do immediately)
5. **Prepare KYC documents** for all services

**Timeline to Production:** 6-8 weeks after business registration starts

---

**Document Version:** 1.0  
**Last Updated:** March 11, 2026  
**Maintained By:** Development Team
