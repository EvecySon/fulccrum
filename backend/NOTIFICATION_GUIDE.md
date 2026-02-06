# Notification System Guide - Step 5 Complete

## ✅ What's Been Implemented

### Multi-Channel Notification System
- **NotificationsService** - Complete notification management with push, email, SMS support
- **NotificationsController** - 11 RESTful endpoints
- **NotificationsModule** - Integrated into the app
- **Device Token Management** - Register and manage mobile devices for push notifications

---

## 📱 Notification Channels

### 1. In-App Notifications
Stored in database, accessible via API

### 2. Push Notifications (Mobile)
- iOS (APNS) - Ready for Firebase Cloud Messaging integration
- Android (FCM) - Ready for Firebase Cloud Messaging integration
- Web Push - Ready for integration

### 3. Email Notifications
- Ready for SendGrid, AWS SES, or similar integration
- Currently logs to console

### 4. SMS Notifications
- Ready for Twilio integration
- Currently logs to console

---

## 🔐 All Endpoints Require Authentication

Include JWT token in all requests:
```
Authorization: Bearer <your_access_token>
```

---

## 📝 Testing Notification Endpoints

### 1. Get All Notifications
```bash
GET http://localhost:3001/notifications?page=1&limit=50
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50)
- `unreadOnly` (optional) - Set to "true" to get only unread notifications

**Response:**
```json
{
  "data": [
    {
      "id": "notification-uuid",
      "type": "order_update",
      "title": "Order ORD-123",
      "message": "Your order has been accepted!",
      "data": {
        "orderId": "order-uuid",
        "status": "accepted"
      },
      "isRead": false,
      "createdAt": "2026-02-06T20:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 10,
    "totalPages": 1,
    "unreadCount": 5
  }
}
```

### 2. Get Unread Notifications Only
```bash
GET http://localhost:3001/notifications?unreadOnly=true
Authorization: Bearer <token>
```

### 3. Create Manual Notification
```bash
POST http://localhost:3001/notifications
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "system_alert",
  "title": "System Maintenance",
  "message": "Scheduled maintenance tonight at 2 AM",
  "data": {
    "maintenanceTime": "2026-02-07T02:00:00Z"
  }
}
```

**Notification Types:**
- `order_update` - Order status changes
- `delivery_update` - Delivery tracking updates
- `payment_update` - Payment/withdrawal updates
- `promotion` - Promotional messages
- `system_alert` - System announcements
- `support_message` - Support chat messages
- `review_request` - Request for reviews

### 4. Mark Notification as Read
```bash
PATCH http://localhost:3001/notifications/:notificationId/read
Authorization: Bearer <token>
```

### 5. Mark All as Read
```bash
PATCH http://localhost:3001/notifications/read-all
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "markedCount": 5
}
```

### 6. Delete Notification
```bash
DELETE http://localhost:3001/notifications/:notificationId
Authorization: Bearer <token>
```

---

## 📱 Device Token Management (Mobile Apps)

### 1. Register Device for Push Notifications
```bash
POST http://localhost:3001/notifications/devices/register
Content-Type: application/json
Authorization: Bearer <token>

{
  "token": "fcm-device-token-here",
  "platform": "android",
  "deviceId": "device-unique-id"
}
```

**Platforms:**
- `ios` - Apple devices
- `android` - Android devices
- `web` - Web push notifications

**Response:**
```json
{
  "id": "device-token-uuid",
  "userId": "user-uuid",
  "platform": "android",
  "deviceId": "device-unique-id",
  "isActive": true,
  "createdAt": "2026-02-06T20:00:00.000Z"
}
```

### 2. Get User's Registered Devices
```bash
GET http://localhost:3001/notifications/devices
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "device-uuid-1",
    "platform": "ios",
    "deviceId": "iPhone-12-Pro",
    "createdAt": "2026-02-06T20:00:00.000Z"
  },
  {
    "id": "device-uuid-2",
    "platform": "android",
    "deviceId": "Samsung-Galaxy-S21",
    "createdAt": "2026-02-05T15:00:00.000Z"
  }
]
```

### 3. Remove Device
```bash
DELETE http://localhost:3001/notifications/devices/:deviceId
Authorization: Bearer <token>
```

---

## 🧪 Testing Notification Channels

### Test Push Notification
```bash
POST http://localhost:3001/notifications/test/push
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Test Push",
  "message": "This is a test push notification"
}
```

**Console Output:**
```
[PUSH] Sending to 2 device(s) for user user-uuid
[PUSH] Title: Test Push
[PUSH] Body: This is a test push notification
```

### Test Email
```bash
POST http://localhost:3001/notifications/test/email
Content-Type: application/json
Authorization: Bearer <token>

{
  "subject": "Test Email",
  "message": "This is a test email notification"
}
```

**Console Output:**
```
[EMAIL] Sending to user@example.com
[EMAIL] Subject: Test Email
[EMAIL] Body: This is a test email notification
```

### Test SMS
```bash
POST http://localhost:3001/notifications/test/sms
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "This is a test SMS notification"
}
```

**Console Output:**
```
[SMS] Sending to +1234567890
[SMS] Message: This is a test SMS notification
```

---

## 🔔 Helper Methods for Common Scenarios

The NotificationsService includes helper methods that are automatically called by other services:

### 1. Order Update Notifications
```typescript
// Automatically called when order status changes
await notificationsService.notifyOrderUpdate(
  userId,
  orderId,
  'accepted',
  'ORD-123'
);
```

**Generates:**
- In-app notification
- Push notification to all user devices
- Title: "Order ORD-123"
- Message: "Your order has been accepted!"

### 2. Withdrawal Update Notifications
```typescript
// Automatically called during withdrawal process
await notificationsService.notifyWithdrawalUpdate(
  userId,
  50.00,
  'completed'
);
```

**Generates:**
- In-app notification
- Push notification
- Title: "Withdrawal Update"
- Message: "Your withdrawal of $50 has been completed"

### 3. New Message Notifications
```typescript
await notificationsService.notifyNewMessage(
  userId,
  'Support Team',
  'Your ticket has been updated'
);
```

---

## 🔗 Integration with Other Services

### Order Service Integration
When order status changes, notifications are automatically sent:

```typescript
// In OrdersService
async updateOrderStatus(orderId, status) {
  // Update order...
  
  // Send notification
  await this.notificationsService.notifyOrderUpdate(
    order.customerId,
    orderId,
    status,
    order.orderNumber
  );
}
```

### Wallet Service Integration
When withdrawal is confirmed:

```typescript
// In WalletService
async confirmWithdrawal(userId, requestId, code) {
  // Process withdrawal...
  
  // Send notification
  await this.notificationsService.notifyWithdrawalUpdate(
    userId,
    amount,
    'confirmed'
  );
}
```

---

## 🚀 Production Integration Steps

### 1. Firebase Cloud Messaging (Push Notifications)

**Install dependencies:**
```bash
npm install firebase-admin
```

**Add to `.env`:**
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

**Uncomment in `notifications.service.ts`:**
```typescript
// Initialize Firebase Admin (add to module)
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

// Uncomment the FCM code in sendPushNotification()
```

### 2. SendGrid (Email)

**Install dependencies:**
```bash
npm install @sendgrid/mail
```

**Add to `.env`:**
```
SENDGRID_API_KEY=your-api-key
FROM_EMAIL=noreply@yourdomain.com
```

**Uncomment in `notifications.service.ts`:**
```typescript
// Uncomment the SendGrid code in sendEmail()
```

### 3. Twilio (SMS)

**Install dependencies:**
```bash
npm install twilio
```

**Add to `.env`:**
```
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Uncomment in `notifications.service.ts`:**
```typescript
// Uncomment the Twilio code in sendSMS()
```

---

## 📊 Complete Test Flow

### Scenario: User Receives Order Update Notification

```bash
# 1. Login
POST http://localhost:3001/auth/login
{
  "email": "customer@test.com",
  "password": "password123"
}
# Save the accessToken

# 2. Register mobile device
POST http://localhost:3001/notifications/devices/register
Authorization: Bearer <token>
{
  "token": "fake-fcm-token-for-testing",
  "platform": "android",
  "deviceId": "my-android-phone"
}

# 3. Create an order (this triggers a notification)
POST http://localhost:3001/orders
Authorization: Bearer <token>
{
  "businessId": "business-uuid",
  "subtotal": 30.00,
  "deliveryFee": 5.00,
  "serviceFee": 2.00,
  "taxAmount": 2.50,
  "totalAmount": 39.50
}

# 4. Check notifications (should see order created notification)
GET http://localhost:3001/notifications?unreadOnly=true
Authorization: Bearer <token>

# 5. Update order status (as business owner - triggers notification)
PATCH http://localhost:3001/orders/<order-id>/status
Authorization: Bearer <business-token>
{
  "status": "accepted"
}

# 6. Check notifications again (should see order accepted notification)
GET http://localhost:3001/notifications?unreadOnly=true
Authorization: Bearer <token>

# 7. Mark notification as read
PATCH http://localhost:3001/notifications/<notification-id>/read
Authorization: Bearer <token>

# 8. Test push notification manually
POST http://localhost:3001/notifications/test/push
Authorization: Bearer <token>
{
  "title": "Test",
  "message": "Testing push notifications"
}
# Check server console for output

# 9. Get all devices
GET http://localhost:3001/notifications/devices
Authorization: Bearer <token>

# 10. Remove device
DELETE http://localhost:3001/notifications/devices/<device-id>
Authorization: Bearer <token>
```

---

## 📈 Notification Statistics

### Get Unread Count
The unread count is included in every notification list response:

```json
{
  "meta": {
    "unreadCount": 5
  }
}
```

Use this to show badge counts in mobile apps.

---

## 🎯 Mobile App Integration Guide

### iOS (Swift)
```swift
// 1. Get FCM token
import FirebaseMessaging

Messaging.messaging().token { token, error in
    if let token = token {
        // Register with backend
        registerDevice(token: token, platform: "ios")
    }
}

// 2. Handle notifications
func userNotificationCenter(_ center: UNUserNotificationCenter,
                          didReceive response: UNNotificationResponse) {
    let userInfo = response.notification.request.content.userInfo
    // Handle notification tap
}
```

### Android (Kotlin)
```kotlin
// 1. Get FCM token
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val token = task.result
        // Register with backend
        registerDevice(token, "android")
    }
}

// 2. Handle notifications
override fun onMessageReceived(remoteMessage: RemoteMessage) {
    // Show notification
    showNotification(remoteMessage.notification?.title, 
                    remoteMessage.notification?.body)
}
```

### React Native
```javascript
// 1. Get FCM token
import messaging from '@react-native-firebase/messaging';

const token = await messaging().getToken();
// Register with backend
await registerDevice(token, Platform.OS);

// 2. Handle notifications
messaging().onMessage(async remoteMessage => {
  // Show in-app notification
  showInAppNotification(remoteMessage);
});
```

---

## 🔒 Security Features

1. **Authorization:** Users can only access their own notifications
2. **Device Validation:** Device tokens are validated before registration
3. **Token Deactivation:** Invalid tokens are automatically deactivated
4. **Rate Limiting:** All endpoints protected by global rate limiter

---

## 📋 API Endpoints Summary

### Notifications (8 endpoints)
- `GET /notifications` - Get user notifications (paginated)
- `POST /notifications` - Create notification
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `POST /notifications/test/push` - Test push notification
- `POST /notifications/test/email` - Test email
- `POST /notifications/test/sms` - Test SMS

### Device Management (3 endpoints)
- `POST /notifications/devices/register` - Register device
- `GET /notifications/devices` - Get user devices
- `DELETE /notifications/devices/:id` - Remove device

---

## ⚠️ Current Limitations

1. **Push Notifications:** Currently logs to console. Requires Firebase setup.
2. **Email:** Currently logs to console. Requires SendGrid/SES setup.
3. **SMS:** Currently logs to console. Requires Twilio setup.
4. **Real-time Updates:** Socket.io gateway exists but not integrated with notifications yet.

---

## 🎯 Next Steps

1. **Test notification endpoints** using the examples above
2. **Set up Firebase** for production push notifications
3. **Integrate SendGrid** for email notifications
4. **Integrate Twilio** for SMS notifications
5. **Connect Socket.io** for real-time notification delivery
6. **Add notification preferences** (user settings for which notifications to receive)

---

**Your backend now has ~50% of core features implemented!** 🎉

All notification infrastructure is ready - just needs production service integrations.
