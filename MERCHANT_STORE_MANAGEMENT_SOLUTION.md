# 🏪 Smart Merchant Store Management System

## Problem Statement

Current challenges with merchant store status and order management:

1. **Fixed schedules unreliable** - Store shows "open" but merchant didn't actually open
2. **Manual toggle unreliable** - Merchant forgets to open app or has no internet
3. **Order acceptance delays** - Merchant offline, customer waits indefinitely
4. **No fallback communication** - Customer can't reach merchant directly

---

## 💡 Comprehensive Solution

### **Multi-Layer Store Status System**

---

## 1. Store Status Logic (Priority-Based)

### **Layer 1: Scheduled Hours (Base Layer)**
```
Default status based on business hours:
- 9:00 AM - 9:00 PM → "should_be_open"
- Outside hours → "should_be_closed"
```

### **Layer 2: Manual Override (Medium Priority)**
```
Merchant can manually control:
- "force_open" → Open even outside business hours
- "force_closed" → Closed even during business hours
- "auto" → Follow scheduled hours (default)
```

### **Layer 3: Activity Detection (Highest Priority)**
```
Real-time merchant activity tracking:
- Last seen < 6 hours → "active" (merchant working today)
- Last seen 6-12 hours → "busy_warning" (may be serving customers)
- Last seen > 12 hours → "inactive" (may have closed early)
- Not active today → "offline" (didn't open today)
```

### **Final Status Calculation:**
```typescript
function getStoreStatus(merchant) {
  const now = new Date();
  const isWithinBusinessHours = checkBusinessHours(now, merchant.businessHours);
  
  // Layer 1: Scheduled hours
  let baseStatus = isWithinBusinessHours ? 'open' : 'closed';
  
  // Layer 2: Manual override
  if (merchant.manualStatus === 'force_closed') {
    baseStatus = 'closed';
  } else if (merchant.manualStatus === 'force_open') {
    baseStatus = 'open';
  }
  
  // Layer 3: Activity detection
  const hoursSinceLastSeen = getHoursSince(merchant.lastSeenAt);
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const wasActiveToday = merchant.lastSeenAt > todayStart;
  
  if (baseStatus === 'open') {
    if (!wasActiveToday) {
      return {
        status: 'open_unverified',
        reliability: 'low',
        message: 'Store has not opened today. Call to confirm availability.',
        showPhone: true
      };
    } else if (hoursSinceLastSeen > 12) {
      return {
        status: 'open_unverified',
        reliability: 'low',
        message: 'Store may have closed early. Call to confirm.',
        showPhone: true
      };
    } else if (hoursSinceLastSeen > 6) {
      return {
        status: 'open_busy',
        reliability: 'medium',
        message: 'Store may be busy with customers. Response time may be longer.',
        showPhone: true
      };
    } else {
      return {
        status: 'open_active',
        reliability: 'high',
        message: 'Store is accepting orders',
        showPhone: false
      };
    }
  }
  
  return {
    status: 'closed',
    reliability: 'high',
    message: 'Store is currently closed',
    showPhone: false
  };
}
```

---

## 2. Order Acceptance Flow

### **Smart Timeout System (NO Auto-Accept):**

```
Customer Places Order
        ↓
[Pending - Waiting for merchant]
        ↓
Send LOUD notifications:
- Push with sound
- SMS to merchant
- In-app alert
        ↓
    Timer: 3 minutes
        ↓
    ┌─────────────────┐
    │ Merchant Action │
    └─────────────────┘
         ↓         ↓
    Accept      Reject
         ↓         ↓
    [Accepted] [Rejected]
         
    If NO ACTION after 3 minutes:
         ↓
    [Pending - Timeout]
         ↓
    ❌ DON'T auto-accept
    ✅ Show merchant phone to customer
    ✅ Send urgent SMS reminder to merchant
    ✅ Customer can call directly
    ✅ Merchant can still accept in app
```

### **Customer Experience During Wait:**

**Minute 0-1:**
```
✅ Order Placed Successfully!

⏱️ Waiting for Mama Jollof's Kitchen to confirm...
(Usually takes 1-2 minutes)

Order #FUL-2026-123
Total: ₦3,500
```

**Minute 1-2:**
```
⏱️ Still waiting for confirmation...

The merchant is reviewing your order.
This usually takes 1-2 minutes.
```

**Minute 2-3:**
```
⏱️ Taking longer than usual...

If not confirmed in 1 minute, we'll show you 
the merchant's phone number so you can call them directly.

The merchant has been notified via SMS and push notification.
```

**After 3 minutes (Timeout - Show Phone):**
```
⚠️ Merchant Has Not Responded

Your order is still pending confirmation.

Please call the merchant directly:
📞 +234 809 012 3456

We've sent them an urgent SMS reminder.

[Wait Longer]  [Cancel Order]  [Contact Support]
```

---

## 3. Database Schema Updates

### **Add to BusinessProfile:**

```prisma
model BusinessProfile {
  // ... existing fields ...
  
  // Store status management
  manualStatus        String?   @default("auto") @map("manual_status") @db.VarChar(20)
  // Values: "auto", "force_open", "force_closed", "paused"
  
  lastSeenAt          DateTime? @map("last_seen_at")
  // Updated every time merchant opens app or interacts
  
  pausedUntil         DateTime? @map("paused_until")
  // Temporary pause with auto-resume time
  
  pauseReason         String?   @map("pause_reason") @db.VarChar(200)
  // "Taking a break", "Restocking", etc.
  
  autoAcceptTimeout   Int       @default(3) @map("auto_accept_timeout")
  // Minutes before auto-accepting orders (default: 3)
  
  showPhoneToCustomers Boolean  @default(true) @map("show_phone_to_customers")
  // Allow customers to see phone number
  
  acceptanceRate      Decimal   @default(100) @map("acceptance_rate") @db.Decimal(5, 2)
  // Track % of orders accepted vs rejected
  
  averageResponseTime Int       @default(0) @map("average_response_time")
  // Average seconds to accept orders
  
  // ... existing relations ...
}
```

### **Add to Order:**

```prisma
model Order {
  // ... existing fields ...
  
  acceptedAt          DateTime? @map("accepted_at")
  // When merchant accepted
  
  merchantNotifiedAt  DateTime? @map("merchant_notified_at")
  // When merchant was first notified
  
  timeoutAt           DateTime? @map("timeout_at")
  // When order timed out (3 min with no response)
  
  merchantResponseTime Int?     @map("merchant_response_time")
  // Seconds taken to respond
  
  // ... existing relations ...
}
```

### **New Model: MerchantActivityLog**

```prisma
model MerchantActivityLog {
  id          String   @id @default(uuid()) @db.Uuid
  merchantId  String   @map("merchant_id") @db.Uuid
  action      String   @db.VarChar(50)
  // "app_opened", "order_accepted", "order_rejected", "status_changed"
  
  metadata    Json?
  // Additional context
  
  ipAddress   String?  @map("ip_address") @db.VarChar(45)
  deviceInfo  String?  @map("device_info") @db.VarChar(200)
  timestamp   DateTime @default(now())
  
  merchant BusinessProfile @relation(fields: [merchantId], references: [userId], onDelete: Cascade)
  
  @@index([merchantId, timestamp])
  @@map("merchant_activity_logs")
}
```

---

## 4. Backend Implementation

### **Service: MerchantStatusService**

```typescript
@Injectable()
export class MerchantStatusService {
  constructor(private prisma: PrismaService) {}

  async updateLastSeen(merchantId: string) {
    await this.prisma.businessProfile.update({
      where: { userId: merchantId },
      data: { lastSeenAt: new Date() }
    });
  }

  async setManualStatus(
    merchantId: string, 
    status: 'auto' | 'force_open' | 'force_closed' | 'paused',
    pauseMinutes?: number,
    reason?: string
  ) {
    const data: any = { manualStatus: status };
    
    if (status === 'paused' && pauseMinutes) {
      data.pausedUntil = new Date(Date.now() + pauseMinutes * 60000);
      data.pauseReason = reason;
    }
    
    return await this.prisma.businessProfile.update({
      where: { userId: merchantId },
      data
    });
  }

  async getStoreStatus(merchantId: string) {
    const merchant = await this.prisma.businessProfile.findUnique({
      where: { userId: merchantId },
      include: { businessHours: true }
    });

    const now = new Date();
    const isWithinBusinessHours = this.checkBusinessHours(now, merchant.businessHours);
    
    let baseStatus = isWithinBusinessHours ? 'open' : 'closed';
    
    // Check manual override
    if (merchant.manualStatus === 'force_closed') {
      baseStatus = 'closed';
    } else if (merchant.manualStatus === 'force_open') {
      baseStatus = 'open';
    } else if (merchant.manualStatus === 'paused') {
      if (merchant.pausedUntil && merchant.pausedUntil > now) {
        return {
          status: 'paused',
          reliability: 'high',
          message: merchant.pauseReason || 'Temporarily unavailable',
          resumesAt: merchant.pausedUntil,
          showPhone: true
        };
      } else {
        // Auto-resume
        await this.setManualStatus(merchantId, 'auto');
        baseStatus = isWithinBusinessHours ? 'open' : 'closed';
      }
    }
    
    // Check activity
    if (baseStatus === 'open' && merchant.lastSeenAt) {
      const minutesSinceLastSeen = 
        (now.getTime() - merchant.lastSeenAt.getTime()) / 60000;
      
      if (minutesSinceLastSeen > 120) {
        return {
          status: 'open_unverified',
          reliability: 'low',
          message: 'Store may not be monitoring orders. Call if urgent.',
          showPhone: true,
          lastSeen: merchant.lastSeenAt
        };
      } else if (minutesSinceLastSeen > 30) {
        return {
          status: 'open_warning',
          reliability: 'medium',
          message: 'Store may be busy. Response time may be longer.',
          showPhone: true,
          lastSeen: merchant.lastSeenAt
        };
      }
    }
    
    return {
      status: baseStatus === 'open' ? 'open_active' : 'closed',
      reliability: baseStatus === 'open' ? 'high' : 'high',
      message: baseStatus === 'open' 
        ? 'Store is actively accepting orders' 
        : 'Store is currently closed',
      showPhone: baseStatus === 'open' ? false : false
    };
  }

  private checkBusinessHours(now: Date, businessHours: any[]): boolean {
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const todayHours = businessHours.find(h => h.dayOfWeek === dayOfWeek);
    if (!todayHours || !todayHours.isOpen) return false;
    
    const openTime = this.timeToMinutes(todayHours.openTime);
    const closeTime = this.timeToMinutes(todayHours.closeTime);
    
    return currentTime >= openTime && currentTime <= closeTime;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
```

### **Service: OrderAutoAcceptService**

```typescript
@Injectable()
export class OrderAutoAcceptService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
    private pushNotificationService: PushNotificationService
  ) {}

  async scheduleAutoAccept(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        business: { include: { user: true } },
        customer: true
      }
    });

    const timeoutMinutes = order.business.autoAcceptTimeout || 3;
    
    // Schedule job to run after timeout
    setTimeout(async () => {
      await this.checkAndAutoAccept(orderId);
    }, timeoutMinutes * 60 * 1000);
  }

  async checkAndAutoAccept(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        business: { include: { user: true } },
        customer: true
      }
    });

    // If still pending, auto-accept
    if (order.status === 'pending') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'accepted',
          autoAccepted: true,
          acceptedAt: new Date(),
          merchantResponseTime: Math.floor(
            (Date.now() - order.merchantNotifiedAt.getTime()) / 1000
          )
        }
      });

      // Notify merchant via SMS
      await this.smsService.send({
        to: order.business.phone,
        message: `New order #${order.orderNumber} auto-accepted. ` +
                 `Customer: ${order.customer.firstName}. ` +
                 `Total: ₦${order.totalAmount}. ` +
                 `Open app to view details.`
      });

      // Send push notification
      await this.pushNotificationService.sendToUser({
        userId: order.business.userId,
        title: '🔔 Order Auto-Accepted',
        body: `Order #${order.orderNumber} was automatically accepted. Please prepare the order.`,
        data: { orderId, type: 'auto_accepted' }
      });

      // Log activity
      await this.prisma.merchantActivityLog.create({
        data: {
          merchantId: order.business.userId,
          action: 'order_auto_accepted',
          metadata: { orderId, orderNumber: order.orderNumber }
        }
      });
    }
  }
}
```

---

## 5. API Endpoints

### **Merchant Endpoints:**

```typescript
// Update store status
PUT /merchant/store/status
Body: {
  status: "auto" | "force_open" | "force_closed" | "paused",
  pauseMinutes?: number,
  reason?: string
}

// Get current store status
GET /merchant/store/status

// Update last seen (heartbeat)
POST /merchant/heartbeat

// Get activity logs
GET /merchant/activity-logs?limit=50
```

### **Customer Endpoints:**

```typescript
// Get store status with reliability info
GET /stores/:id/status
Response: {
  status: "open_active" | "open_warning" | "open_unverified" | "closed" | "paused",
  reliability: "high" | "medium" | "low",
  message: string,
  showPhone: boolean,
  phone?: string,
  lastSeen?: Date,
  resumesAt?: Date
}
```

---

## 6. UI/UX Implementation

### **Customer App - Store Card:**

```
┌─────────────────────────────────────┐
│ 🍕 Mama Jollof's Kitchen            │
│                                     │
│ 🟢 Open & Active                    │
│ Usually responds in 1-2 minutes     │
│                                     │
│ ⭐ 4.8  •  30-40 min  •  ₦500 min   │
└─────────────────────────────────────┘
```

```
┌─────────────────────────────────────┐
│ 🍕 Mama Jollof's Kitchen            │
│                                     │
│ 🟡 Open (May be busy)               │
│ Response time may be longer         │
│ 📞 Call if urgent: 0809 012 3456    │
│                                     │
│ ⭐ 4.8  •  30-40 min  •  ₦500 min   │
└─────────────────────────────────────┘
```

```
┌─────────────────────────────────────┐
│ 🍕 Mama Jollof's Kitchen            │
│                                     │
│ ⚪ Temporarily Unavailable           │
│ Taking a break - Back at 3:00 PM    │
│ 📞 Call: 0809 012 3456              │
│                                     │
│ ⭐ 4.8  •  30-40 min  •  ₦500 min   │
└─────────────────────────────────────┘
```

### **Merchant App - Dashboard:**

```
┌─────────────────────────────────────┐
│ Store Status                        │
│                                     │
│ 🟢 Open & Accepting Orders          │
│                                     │
│ [Auto] [Force Open] [Force Close]   │
│ [Pause for 30 min]                  │
│                                     │
│ Acceptance Rate: 95%                │
│ Avg Response Time: 1.5 min          │
└─────────────────────────────────────┘
```

---

## 7. Benefits of This System

### **For Customers:**
✅ Know real store status, not just scheduled hours
✅ See if merchant is actively monitoring
✅ Can call merchant directly if needed
✅ Orders don't get stuck in limbo
✅ Clear expectations on response time

### **For Merchants:**
✅ Flexible control (auto, manual, pause)
✅ Don't lose orders if temporarily busy
✅ SMS backup if they miss app notification
✅ Can pause with auto-resume
✅ Track their own performance

### **For Platform:**
✅ Reduced customer complaints
✅ Better order completion rate
✅ Data on merchant reliability
✅ Automatic fallback mechanisms
✅ Improved trust and transparency

---

## 8. Edge Cases Handled

| Scenario | Solution |
|----------|----------|
| Merchant forgets to open app | Auto-open based on business hours + activity warning |
| Merchant has no internet | Auto-accept after 3 min + SMS notification |
| Merchant phone is off | Customer sees warning + can call store phone |
| Merchant on break | Can pause with auto-resume timer |
| Customer waiting too long | Auto-accept + show merchant contact |
| Store closed but merchant available | Force open option |
| Store open but merchant unavailable | Activity detection shows warning |

---

## 9. Implementation Priority

### **Phase 1: Critical (Do First)**
1. ✅ Add database fields (manualStatus, lastSeenAt, autoAccepted)
2. ✅ Implement auto-accept after 3 minutes
3. ✅ Show merchant phone in order details
4. ✅ Basic activity tracking (lastSeenAt)

### **Phase 2: Important (Do Next)**
1. Multi-layer status calculation
2. SMS notification on auto-accept
3. Pause functionality with auto-resume
4. Activity logs

### **Phase 3: Nice to Have**
1. Analytics dashboard for merchants
2. Customer notifications about store status changes
3. Predictive busy times
4. Smart timeout adjustment based on merchant history

---

## 10. Testing Scenarios

```
Test 1: Happy Path
- Merchant online
- Order placed
- Merchant accepts in 1 minute
✅ Expected: Normal flow

Test 2: Merchant Offline
- Merchant last seen 1 hour ago
- Order placed
- No response for 3 minutes
✅ Expected: Auto-accept + SMS sent

Test 3: Manual Override
- Outside business hours (10 PM)
- Merchant sets "force_open"
- Customer can order
✅ Expected: Store shows as open

Test 4: Pause with Resume
- Merchant pauses for 30 minutes
- Customer sees "Back at X time"
- After 30 min, auto-resumes
✅ Expected: Store auto-opens

Test 5: Activity Warning
- Merchant last seen 45 minutes ago
- Customer views store
✅ Expected: Shows warning + phone number
```

---

**This system ensures reliability for both customers and merchants while handling all edge cases gracefully!** 🎯
