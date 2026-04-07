# Paystack Integration Setup

## Current Status: MOCK MODE ✅

The app is currently running in **mock mode** with a beautiful Uber-level card addition UX. Everything works for development and testing without real Paystack API keys.

---

## How It Works Now (Mock Mode)

### Backend
- `PaystackMockService` automatically activates when no real API keys are detected
- Returns fake successful responses without calling Paystack API
- Simulates card tokenization with realistic data

### Frontend
- Beautiful in-app payment modal (slides up like Uber Eats)
- Card input form with validation
- Smooth animations and transitions
- Professional UX matching industry standards

### User Flow
1. Click + button in Saved Cards screen
2. Beautiful modal slides up from bottom
3. User enters card details (any valid format works)
4. Click "Pay ₦50.00"
5. 2-second processing animation
6. Card saved successfully
7. Modal closes, card appears in list

---

## Switching to Real Paystack (When Ready)

### Step 1: Get Paystack API Keys

1. Go to https://paystack.com
2. Sign up for an account
3. Complete business verification (required for Nigerian businesses)
4. Navigate to Settings → API Keys & Webhooks
5. Copy your **Test Keys** (for development):
   - Secret Key: `sk_test_xxxxxxxxxxxxx`
   - Public Key: `pk_test_xxxxxxxxxxxxx`

### Step 2: Update Environment Variables

Edit `backend/.env`:

```bash
# Replace these placeholder values with your real keys
PAYSTACK_SECRET_KEY="sk_test_your_actual_secret_key_here"
PAYSTACK_PUBLIC_KEY="pk_test_your_actual_public_key_here"
PAYSTACK_CALLBACK_URL="http://localhost:3001/payment/callback"
```

### Step 3: Restart Backend

```bash
cd backend
npm run start:dev
```

The backend will automatically detect real keys and switch from `PaystackMockService` to `PaystackService`.

You'll see this log:
```
[PAYMENT MODULE] Using REAL Paystack service
```

### Step 4: Update Frontend (Optional)

For production, you may want to use Paystack's actual inline popup instead of our mock modal:

1. Add Paystack.js to your HTML:
```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

2. Replace `MockPaystackScreen` navigation with Paystack Inline:
```typescript
const handler = PaystackPop.setup({
  key: 'pk_test_xxxxx',
  email: user.email,
  amount: 5000,
  ref: response.reference,
  onClose: () => {},
  callback: (response) => {
    // Save card
  }
});
handler.openIframe();
```

---

## Testing with Real Paystack

Paystack provides test cards:

### Successful Card
- **Card Number**: `5060 6666 6666 6666 666`
- **CVV**: `123`
- **Expiry**: Any future date
- **PIN**: `1234`
- **OTP**: `123456`

### Failed Card
- **Card Number**: `5060 0000 0000 0000 000`

More test cards: https://paystack.com/docs/payments/test-payments

---

## Production Deployment

### Step 1: Get Live Keys
1. Complete Paystack business verification
2. Get live keys from dashboard
3. Update production `.env` with live keys:
   ```bash
   PAYSTACK_SECRET_KEY="sk_live_xxxxxxxxxxxxx"
   PAYSTACK_PUBLIC_KEY="pk_live_xxxxxxxxxxxxx"
   ```

### Step 2: Update Callback URL
```bash
PAYSTACK_CALLBACK_URL="https://yourdomain.com/payment/callback"
```

### Step 3: Configure Webhooks
1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/payment/webhook`
3. Copy webhook secret
4. Add to `.env`:
   ```bash
   PAYSTACK_WEBHOOK_SECRET="your_webhook_secret"
   ```

---

## Why Mock Mode?

### Benefits
- ✅ **No API keys needed** - Start developing immediately
- ✅ **No external dependencies** - Works offline
- ✅ **Faster testing** - No network latency
- ✅ **Perfect UX** - Same beautiful interface as production
- ✅ **No costs** - No Paystack transaction fees during development

### When to Switch
- When testing real payment flows
- When integrating with production systems
- Before deploying to production
- When testing webhook integrations

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React Native)         │
│                                         │
│  SavedCardsScreen                       │
│       ↓                                 │
│  MockPaystackScreen (Beautiful Modal)   │
│       ↓                                 │
│  POST /payment/cards/add                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Backend (NestJS)                │
│                                         │
│  PaymentController                      │
│       ↓                                 │
│  PaymentService                         │
│       ↓                                 │
│  ┌─────────────────────────────────┐   │
│  │ Auto-selects based on .env:     │   │
│  │                                 │   │
│  │ No real keys?                   │   │
│  │   → PaystackMockService ✅      │   │
│  │                                 │   │
│  │ Real keys found?                │   │
│  │   → PaystackService (Real API)  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Troubleshooting

### "Invalid key" Error
- Check that `.env` has real Paystack keys
- Restart backend after updating `.env`
- Verify keys are test keys (start with `sk_test_` and `pk_test_`)

### "Request timeout" Error
- Normal in mock mode if backend isn't running
- In real mode, check internet connection
- Paystack API might be slow - timeout is set to 30 seconds

### Card Not Saving
- Check backend logs for errors
- Verify database is running
- Check that `/payment/cards` endpoint has nonce configured

---

## Support

- **Paystack Docs**: https://paystack.com/docs
- **Paystack Support**: support@paystack.com
- **Test Cards**: https://paystack.com/docs/payments/test-payments
