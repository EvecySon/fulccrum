# 📝 Admin Notification Template Management

## Quick Answer

**YES!** You can manage notification messages from the admin panel instead of hardcoding them.

---

## How It Works

### **Admin Panel Features:**
- ✅ Create/edit notification messages
- ✅ Change "Aren't you hungry yet?" to anything you want
- ✅ Enable/disable messages
- ✅ Use variables like `{userName}`, `{orderNumber}`
- ✅ A/B test different messages
- ✅ See which messages perform best

---

## Database Schema Needed

Add `NotificationTemplate` model to store messages:

```prisma
model NotificationTemplate {
  id          String   @id @default(uuid())
  key         String   @unique
  name        String
  title       String   // "😋 Hungry Yet?"
  body        String   // "Time to order something hot!"
  type        String   // 'engagement', 'reminder', etc.
  category    String   // 'customer', 'merchant', 'driver'
  isActive    Boolean  @default(true)
  sentCount   Int      @default(0)
  openCount   Int      @default(0)
  createdAt   DateTime @default(now())
}
```

---

## API Endpoints

```
POST   /admin/notification-templates     - Create template
GET    /admin/notification-templates     - List all
PUT    /admin/notification-templates/:id - Update
DELETE /admin/notification-templates/:id - Delete
```

---

## Example Templates

**Customer Engagement:**
```json
{
  "title": "🍕 Wake Up!",
  "body": "Today won't order itself. Let's get you something tasty!",
  "type": "engagement"
}
```

**Merchant Reminder:**
```json
{
  "title": "🏪 Time to Open!",
  "body": "Don't keep people hungry! Your customers are waiting.",
  "type": "reminder"
}
```

---

## Benefits

- Change messages anytime without code changes
- Test different messages to see what works
- Personalize with user data
- Track performance (open rates, click rates)

---

**Full implementation details in: `NOTIFICATION_TEMPLATE_MANAGEMENT.md`**
