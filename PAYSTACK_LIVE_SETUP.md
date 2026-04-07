# 🚀 Paystack Live Integration Setup Guide

This guide will help you remove all mock data and set up real end-to-end Paystack integration.

## 📋 Prerequisites

1. **Paystack Account**: Sign up at https://dashboard.paystack.com
2. **Test API Keys**: Get from Dashboard → Settings → API Keys & Webhooks
3. **Bank Account**: For receiving payments (production only)

---

## 🔑 Step 1: Get Your Paystack API Keys

### Test Mode (Development)
1. Go to https://dashboard.paystack.com/#/settings/developer
2. Copy your **Test Secret Key** (starts with `sk_test_`)
3. Copy your **Test Public Key** (starts with `pk_test_`)

### Live Mode (Production)
1. Complete business verification on Paystack
2. Activate your account
3. Get **Live Secret Key** (starts with `sk_live_`)
4. Get **Live Public Key** (starts with `pk_live_`)

---

## ⚙️ Step 2: Configure Backend

### Update `.env` file:

```bash
# Backend .env
PAYSTACK_SECRET_KEY="sk_test_YOUR_ACTUAL_KEY_HERE"
PAYSTACK_PUBLIC_KEY="pk_test_YOUR_ACTUAL_KEY_HERE"
PAYSTACK_CALLBACK_URL="http://localhost:3001/payment/callback"
```

**Important**: Replace `YOUR_ACTUAL_KEY_HERE` with your real keys from Paystack dashboard.

---

## 🌐 Step 3: Configure Frontend

### Create/Update `frontend/.env`:

```bash
# Frontend .env
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_YOUR_ACTUAL_KEY_HERE"
EXPO_PUBLIC_API_URL="http://localhost:3001"
```

---

## 🔄 Step 4: Remove Mock Services

The system will automatically detect real API keys and disable mock mode:

### Backend Auto-Detection:
```typescript
// payment.module.ts
if (!secretKey || secretKey.includes('your_paystack_secret_key_here')) {
  console.log('Using MOCK Paystack service');
  return new PaystackMockService();
}
console.log('Using REAL Paystack service'); // ✅ This will activate
return new PaystackService(config);
```

### What Gets Disabled:
- ❌ MockPaystackScreen (replaced with real Paystack Popup)
- ❌ Mock virtual account creation
- ❌ Mock USSD codes
- ❌ Mock payment verification

### What Gets Enabled:
- ✅ Real Paystack payment popup
- ✅ Real virtual account creation (Wema Bank)
- ✅ Real USSD codes for 6 Nigerian banks
- ✅ Real payment verification
- ✅ Real webhook notifications

---

## 🪝 Step 5: Configure Webhooks (Production)

### For Local Development:
Use **ngrok** to expose your local server:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Expose your backend
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### Configure in Paystack Dashboard:
1. Go to Settings → API Keys & Webhooks
2. Add webhook URL: `https://your-ngrok-url.ngrok.io/payment/webhook`
3. Save

### For Production:
Use your actual domain:
```
https://api.yourdomain.com/payment/webhook
```

---

## 🧪 Step 6: Test Real Integration

### Test Card Payment:
1. Go to Wallet Top-Up screen
2. Enter amount (e.g., ₦1000)
3. Select "Card Payment"
4. Use Paystack test card:
   - **Card Number**: `5060666666666666666`
   - **Expiry**: Any future date
   - **CVV**: `123`
   - **PIN**: `1234`
   - **OTP**: `123456`

### Test Bank Transfer:
1. Select "Bank Transfer"
2. You'll get a real Wema Bank virtual account
3. Transfer money to that account
4. Webhook will credit your wallet automatically

### Test USSD:
1. Select "USSD Payment"
2. Choose your bank (e.g., GTBank)
3. Dial the USSD code on your phone
4. Follow prompts to complete payment

---

## 🔍 Step 7: Verify Integration

### Check Backend Logs:
```bash
cd backend && npm run start:dev
```

Look for:
```
[PAYMENT MODULE] Using REAL Paystack service ✅
[PAYSTACK] Creating dedicated virtual account for: user@example.com
[PAYSTACK] Virtual account created: 8123456789
```

### Check Frontend:
- No more "Mock" labels on screens
- Real Paystack popup appears
- Real account numbers displayed
- Real USSD codes generated

---

## 🚨 Troubleshooting

### Issue: Still seeing mock data
**Solution**: 
1. Check `.env` has real keys (no placeholders)
2. Restart backend server
3. Clear frontend cache: `cd frontend && npm start -- --clear`

### Issue: "Invalid API Key"
**Solution**:
1. Verify keys are correct (copy-paste from dashboard)
2. Check for extra spaces or quotes
3. Ensure using test keys for development

### Issue: Webhook not working
**Solution**:
1. Verify ngrok is running
2. Check webhook URL in Paystack dashboard
3. Test webhook: Dashboard → Webhooks → Test
4. Check backend logs for webhook events

### Issue: Virtual account not created
**Solution**:
1. Check Paystack dashboard for errors
2. Verify business is verified (for live mode)
3. Check backend logs for error messages

---

## 📊 Monitoring

### Paystack Dashboard:
- View all transactions
- Check webhook deliveries
- Monitor virtual accounts
- View USSD payments

### Backend Logs:
```bash
# Watch logs in real-time
cd backend && npm run start:dev | grep PAYSTACK
```

---

## 🔐 Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** for all keys
3. **Use test keys** for development
4. **Use live keys** only in production
5. **Rotate keys** if compromised
6. **Verify webhook signatures** (already implemented)

---

## 🎯 Production Checklist

Before going live:

- [ ] Business verified on Paystack
- [ ] Live API keys configured
- [ ] Webhook URL set to production domain
- [ ] SSL certificate installed (HTTPS)
- [ ] Test all payment methods
- [ ] Monitor first transactions
- [ ] Set up error alerts
- [ ] Configure payout schedule

---

## 📞 Support

- **Paystack Support**: support@paystack.com
- **Paystack Docs**: https://paystack.com/docs
- **Paystack Status**: https://status.paystack.com

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Backend logs show "Using REAL Paystack service"
2. ✅ Real Paystack popup appears (not MockPaystackScreen)
3. ✅ Virtual accounts have real Wema Bank account numbers
4. ✅ USSD codes work on your phone
5. ✅ Webhooks credit wallet automatically
6. ✅ Transactions appear in Paystack dashboard

---

**Ready to go live!** 🚀
