# 🔐 Credentials Setup Guide

## ✅ You've opened all three accounts - Great!

Now let's add your credentials to get everything working.

---

## 📋 Step-by-Step Setup

### 1. Copy the Environment File

```bash
cd backend
copy .env.example .env
```

Or manually create `backend/.env` file.

---

## 🔑 Getting Your API Keys

### 1️⃣ Paystack (Payment Gateway)

**Where to find your keys:**
1. Go to https://dashboard.paystack.com
2. Login to your account
3. Click on **Settings** (left sidebar)
4. Click on **API Keys & Webhooks**
5. You'll see:
   - **Public Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

**Add to `.env`:**
```env
PAYSTACK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxx"
PAYSTACK_PUBLIC_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxx"
```

**Important:**
- Use **test keys** for development (starts with `sk_test_` and `pk_test_`)
- Use **live keys** for production (starts with `sk_live_` and `pk_live_`)

---

### 2️⃣ Termii (SMS Provider)

**Where to find your API key:**
1. Go to https://accounts.termii.com
2. Login to your account
3. Click on **API** in the left menu
4. Copy your **API Key**

**Add to `.env`:**
```env
TERMII_API_KEY="TLxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TERMII_SENDER_ID="Fulccrum"
```

**Notes:**
- Sender ID is your brand name (max 11 characters)
- Must be approved by Termii before use
- Default "Fulccrum" can be changed to your brand

---

### 3️⃣ Firebase (Push Notifications)

**Where to get credentials:**
1. Go to https://console.firebase.google.com
2. Select your project (or create new one)
3. Click the **gear icon** ⚙️ next to "Project Overview"
4. Click **Project settings**
5. Go to **Service accounts** tab
6. Click **Generate new private key**
7. Download the JSON file

**The JSON file looks like this:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

**Extract these three values and add to `.env`:**
```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
```

**⚠️ Important for FIREBASE_PRIVATE_KEY:**
- Keep the `\n` characters (they represent line breaks)
- Keep the quotes around the entire key
- The key should be one long line with `\n` where line breaks are

---

## 📝 Complete `.env` File Template

Here's what your complete `.env` file should look like:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cascade_dev?schema=public"

# JWT Configuration
JWT_SECRET="change-me-to-a-secure-random-string-in-production"
JWT_EXPIRES_IN="1h"
JWT_ISSUER="fulccrum-delivery"
JWT_AUDIENCE="fulccrum-app"

# Server Configuration
PORT=3001
NODE_ENV=development

# Paystack (Nigerian Payment Gateway)
PAYSTACK_SECRET_KEY="sk_test_your_actual_key_here"
PAYSTACK_PUBLIC_KEY="pk_test_your_actual_key_here"
PAYSTACK_CALLBACK_URL="http://localhost:3001/payment/callback"

# Termii (Nigerian SMS Provider)
TERMII_API_KEY="your_actual_termii_api_key_here"
TERMII_SENDER_ID="Fulccrum"

# Firebase Cloud Messaging (Push Notifications)
FIREBASE_PROJECT_ID="your-actual-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"

# File Upload Configuration
UPLOAD_DIR="./uploads"
```

---

## 🚀 Testing Your Setup

After adding all credentials, test each service:

### 1. Start the Server
```bash
npm run start:dev
```

**Expected output:**
```
[FIREBASE] Initialized successfully
[Nest] Application successfully started
```

### 2. Test Paystack
```bash
# Initialize a payment
POST http://localhost:3001/payment/initialize
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "orderId": "your-order-id",
  "amount": 5000
}
```

### 3. Test Termii SMS
```bash
# Send test SMS
POST http://localhost:3001/notifications/test/sms
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "phoneNumber": "+2348012345678",
  "message": "Test SMS from Fulccrum"
}
```

### 4. Test Firebase Push
```bash
# Send test push notification
POST http://localhost:3001/notifications/test/push
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "title": "Test Notification",
  "body": "This is a test push notification"
}
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Firebase not initialized"
**Solution:** Check that:
- All three Firebase credentials are in `.env`
- Private key has `\n` characters preserved
- No extra spaces in the credentials

### Issue: "Paystack payment failed"
**Solution:** 
- Verify you're using test keys (starts with `sk_test_`)
- Check your Paystack dashboard is active
- Ensure amount is in Naira (NGN)

### Issue: "Termii SMS not sending"
**Solution:**
- Verify API key is correct
- Check your Termii account has credits
- Ensure phone number format is correct (+234...)

---

## 🔒 Security Best Practices

### For Development
- ✅ Use test/sandbox keys
- ✅ Keep `.env` file in `.gitignore`
- ✅ Never commit credentials to Git

### For Production
- ✅ Use live/production keys
- ✅ Store credentials in environment variables (not in files)
- ✅ Use secrets management (Railway, Render, etc.)
- ✅ Enable webhook signature verification
- ✅ Use HTTPS only

---

## 📱 Mobile App Configuration

### For React Native Apps

**Paystack:**
```javascript
// Add to your mobile app
const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxx'; // From your .env
```

**Firebase:**
1. Download `google-services.json` (Android)
2. Download `GoogleService-Info.plist` (iOS)
3. Add to your React Native project
4. Install `@react-native-firebase/messaging`

---

## ✅ Verification Checklist

Before deploying to production:

- [ ] Paystack test payment works
- [ ] Termii SMS sends successfully
- [ ] Firebase push notifications deliver
- [ ] All credentials are in `.env`
- [ ] `.env` is in `.gitignore`
- [ ] Server starts without errors
- [ ] Mobile apps can connect to API

---

## 🎯 Next Steps

1. **Copy `.env.example` to `.env`**
2. **Add your actual API keys** (from Paystack, Termii, Firebase)
3. **Start the server:** `npm run start:dev`
4. **Test each integration** using the endpoints above
5. **Integrate with mobile apps**

---

## 📞 Support Links

- **Paystack Docs:** https://paystack.com/docs
- **Termii Docs:** https://developers.termii.com
- **Firebase Docs:** https://firebase.google.com/docs/cloud-messaging

---

**Your backend is ready! Just add your credentials and start testing! 🚀**
