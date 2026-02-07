# Promotions & Discounts System - Complete Guide

## 🎉 Promotions & Discounts Implemented!

Complete promo code and discount system for customer acquisition, retention, and marketing campaigns. Supports percentage and fixed discounts with flexible rules and usage limits.

---

## 📊 What's Been Implemented

### Database Models (2)
1. **PromoCode** - Promo code configuration and rules
2. **PromoUsage** - Track promo code usage by customers

### API Endpoints (9)

#### Admin/Business (6)
- `POST /promos` - Create promo code
- `GET /promos` - List all promo codes
- `GET /promos/:id` - Get promo details
- `PUT /promos/:id` - Update promo code
- `PATCH /promos/:id/toggle` - Activate/deactivate promo
- `DELETE /promos/:id` - Delete promo code
- `GET /promos/:id/stats` - Get promo statistics

#### Customer (2)
- `POST /promos/validate` - Validate promo code for order
- `GET /promos/my-usage` - Get customer's promo usage history

---

## 🧪 Testing Promotions

### 1. Create Percentage Discount (20% off)

```bash
POST http://localhost:3001/promos
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "code": "WELCOME20",
  "description": "20% off for new customers",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscount": 1000,
  "minimumOrder": 2000,
  "usageLimit": 1000,
  "usageLimitPerUser": 1,
  "validFrom": "2026-02-01T00:00:00Z",
  "validUntil": "2026-12-31T23:59:59Z",
  "applicableTo": "first_order"
}
```

**Response:**
```json
{
  "id": "promo-uuid",
  "code": "WELCOME20",
  "description": "20% off for new customers",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscount": 1000,
  "minimumOrder": 2000,
  "usageLimit": 1000,
  "usageLimitPerUser": 1,
  "usedCount": 0,
  "validFrom": "2026-02-01T00:00:00.000Z",
  "validUntil": "2026-12-31T23:59:59.000Z",
  "applicableTo": "first_order",
  "businessId": null,
  "isActive": true,
  "createdAt": "2026-02-06T23:58:00.000Z",
  "updatedAt": "2026-02-06T23:58:00.000Z"
}
```

### 2. Create Fixed Discount (₦500 off)

```bash
POST http://localhost:3001/promos
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "code": "SAVE500",
  "description": "₦500 off on orders above ₦3000",
  "discountType": "fixed",
  "discountValue": 500,
  "minimumOrder": 3000,
  "usageLimit": 500,
  "usageLimitPerUser": 3,
  "validFrom": "2026-02-01T00:00:00Z",
  "validUntil": "2026-03-31T23:59:59Z",
  "applicableTo": "all"
}
```

### 3. Create Business-Specific Promo

```bash
POST http://localhost:3001/promos
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "code": "JOLLOF15",
  "description": "15% off at Mama's Kitchen",
  "discountType": "percentage",
  "discountValue": 15,
  "maxDiscount": 750,
  "minimumOrder": 1500,
  "validFrom": "2026-02-01T00:00:00Z",
  "validUntil": "2026-02-28T23:59:59Z",
  "applicableTo": "specific_business",
  "businessId": "business-uuid"
}
```

### 4. Validate Promo Code (Customer)

```bash
POST http://localhost:3001/promos/validate
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "code": "WELCOME20",
  "orderAmount": 5000,
  "businessId": "business-uuid"
}
```

**Response:**
```json
{
  "valid": true,
  "promoCode": {
    "id": "promo-uuid",
    "code": "WELCOME20",
    "description": "20% off for new customers",
    "discountType": "percentage",
    "discountValue": 20
  },
  "discountAmount": 1000,
  "finalAmount": 4000
}
```

**Validation Checks:**
- ✅ Promo code exists and is active
- ✅ Current date is within valid period
- ✅ Usage limit not exceeded
- ✅ User hasn't exceeded per-user limit
- ✅ Order amount meets minimum requirement
- ✅ Applicable to the business (if specific)
- ✅ First order check (if applicable)

### 5. Get All Promo Codes

```bash
GET http://localhost:3001/promos?page=1&limit=20&activeOnly=true
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "promo-uuid",
      "code": "WELCOME20",
      "description": "20% off for new customers",
      "discountType": "percentage",
      "discountValue": 20,
      "usedCount": 45,
      "usageLimit": 1000,
      "isActive": true,
      "validFrom": "2026-02-01T00:00:00.000Z",
      "validUntil": "2026-12-31T23:59:59.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

### 6. Get Promo Statistics

```bash
GET http://localhost:3001/promos/<promo-id>/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "code": "WELCOME20",
  "totalUsages": 45,
  "uniqueUsers": 45,
  "totalDiscountGiven": 38500,
  "averageDiscountPerUse": 855.56,
  "usageLimit": 1000,
  "remainingUses": 955,
  "isActive": true,
  "validFrom": "2026-02-01T00:00:00.000Z",
  "validUntil": "2026-12-31T23:59:59.000Z"
}
```

### 7. Get Customer's Promo Usage History

```bash
GET http://localhost:3001/promos/my-usage?page=1&limit=20
Authorization: Bearer <customer-token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "usage-uuid",
      "promoCodeId": "promo-uuid",
      "orderId": "order-uuid",
      "discountAmount": 1000,
      "usedAt": "2026-02-06T20:30:00.000Z",
      "promoCode": {
        "code": "WELCOME20",
        "description": "20% off for new customers",
        "discountType": "percentage",
        "discountValue": 20
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

### 8. Update Promo Code

```bash
PUT http://localhost:3001/promos/<promo-id>
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "description": "25% off for new customers (updated)",
  "discountValue": 25,
  "usageLimit": 2000
}
```

### 9. Toggle Promo Status

```bash
PATCH http://localhost:3001/promos/<promo-id>/toggle
Authorization: Bearer <admin-token>
```

### 10. Delete Promo Code

```bash
DELETE http://localhost:3001/promos/<promo-id>
Authorization: Bearer <admin-token>
```

---

## 📱 Mobile App Integration

### React Native - Apply Promo Code

```javascript
import { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';

const PromoCodeInput = ({ orderAmount, businessId, onPromoApplied }) => {
  const [promoCode, setPromoCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);

  const validatePromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    setValidating(true);
    try {
      const response = await fetch('http://api.fulccrum.com/promos/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode.toUpperCase(),
          orderAmount,
          businessId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedPromo(data);
        onPromoApplied(data);
        Alert.alert(
          'Promo Applied!',
          `You saved ₦${data.discountAmount.toFixed(2)}!`
        );
      } else {
        Alert.alert('Invalid Promo', data.message || 'This promo code is not valid');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate promo code');
    } finally {
      setValidating(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    onPromoApplied(null);
  };

  return (
    <View style={styles.container}>
      {!appliedPromo ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter promo code"
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
            editable={!validating}
          />
          <Button
            title={validating ? 'Validating...' : 'Apply'}
            onPress={validatePromo}
            disabled={validating}
          />
        </View>
      ) : (
        <View style={styles.appliedContainer}>
          <View style={styles.promoInfo}>
            <Text style={styles.promoCode}>✓ {appliedPromo.promoCode.code}</Text>
            <Text style={styles.discount}>
              -₦{appliedPromo.discountAmount.toFixed(2)}
            </Text>
          </View>
          <Button title="Remove" onPress={removePromo} color="red" />
        </View>
      )}
    </View>
  );
};

// Usage in checkout screen
const CheckoutScreen = () => {
  const [subtotal] = useState(5000);
  const [discount, setDiscount] = useState(0);
  const [promoData, setPromoData] = useState(null);

  const handlePromoApplied = (data) => {
    if (data) {
      setDiscount(data.discountAmount);
      setPromoData(data.promoCode);
    } else {
      setDiscount(0);
      setPromoData(null);
    }
  };

  const total = subtotal - discount;

  return (
    <View style={styles.checkout}>
      <Text>Subtotal: ₦{subtotal.toFixed(2)}</Text>
      
      <PromoCodeInput
        orderAmount={subtotal}
        businessId={businessId}
        onPromoApplied={handlePromoApplied}
      />

      {discount > 0 && (
        <Text style={styles.savings}>
          Discount: -₦{discount.toFixed(2)}
        </Text>
      )}

      <Text style={styles.total}>Total: ₦{total.toFixed(2)}</Text>

      <Button
        title="Place Order"
        onPress={() => placeOrder(promoData?.id)}
      />
    </View>
  );
};
```

---

## 🎯 Promo Code Types

### 1. Percentage Discount
- Discount as percentage of order amount
- Optional maximum discount cap
- Example: 20% off, max ₦1000

### 2. Fixed Discount
- Fixed amount off order
- Example: ₦500 off

### 3. Applicability Types

**All Orders:**
```json
{
  "applicableTo": "all"
}
```

**First Order Only:**
```json
{
  "applicableTo": "first_order"
}
```

**Specific Business:**
```json
{
  "applicableTo": "specific_business",
  "businessId": "business-uuid"
}
```

---

## 🔒 Validation Rules

### Automatic Checks
1. **Active Status** - Promo must be active
2. **Date Range** - Current date within valid period
3. **Usage Limit** - Total uses not exceeded
4. **Per-User Limit** - User hasn't exceeded their limit
5. **Minimum Order** - Order amount meets minimum
6. **Business Match** - Applicable to the business (if specific)
7. **First Order** - User's first order (if applicable)

### Error Messages
- "Invalid promo code" - Code doesn't exist
- "Promo code is not active" - Deactivated
- "Promo code has expired" - Outside valid period
- "Usage limit reached" - No more uses available
- "You have already used this promo code" - Per-user limit
- "Minimum order amount of ₦X required" - Below minimum
- "Not applicable to this business" - Wrong business
- "Only valid for first orders" - Not first order

---

## 📊 Discount Calculation

### Percentage Discount
```javascript
discount = (orderAmount * discountValue) / 100
if (maxDiscount && discount > maxDiscount) {
  discount = maxDiscount
}
```

**Example:**
- Order: ₦5000
- Promo: 20% off, max ₦1000
- Calculation: 5000 × 0.20 = ₦1000
- Final discount: ₦1000 (capped)

### Fixed Discount
```javascript
discount = discountValue
if (discount > orderAmount) {
  discount = orderAmount
}
```

**Example:**
- Order: ₦3000
- Promo: ₦500 off
- Final discount: ₦500

---

## 🎨 Use Cases

### Use Case 1: Welcome Discount
```json
{
  "code": "WELCOME20",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscount": 1000,
  "minimumOrder": 2000,
  "usageLimitPerUser": 1,
  "applicableTo": "first_order"
}
```

### Use Case 2: Flash Sale
```json
{
  "code": "FLASH50",
  "discountType": "fixed",
  "discountValue": 50,
  "minimumOrder": 1000,
  "usageLimit": 100,
  "validFrom": "2026-02-14T00:00:00Z",
  "validUntil": "2026-02-14T23:59:59Z",
  "applicableTo": "all"
}
```

### Use Case 3: Restaurant Partnership
```json
{
  "code": "MAMA15",
  "discountType": "percentage",
  "discountValue": 15,
  "minimumOrder": 1500,
  "applicableTo": "specific_business",
  "businessId": "mama-kitchen-uuid"
}
```

### Use Case 4: Loyalty Reward
```json
{
  "code": "LOYAL500",
  "discountType": "fixed",
  "discountValue": 500,
  "minimumOrder": 3000,
  "usageLimitPerUser": 5,
  "applicableTo": "all"
}
```

---

## 📝 Database Schema

### PromoCode
```
id: UUID
code: String (unique, max 50 chars)
description: Text (optional)
discountType: String ('percentage' or 'fixed')
discountValue: Decimal(10,2)
maxDiscount: Decimal(10,2) (optional)
minimumOrder: Decimal(10,2)
usageLimit: Integer (optional)
usageLimitPerUser: Integer (optional)
usedCount: Integer (default 0)
validFrom: DateTime
validUntil: DateTime
applicableTo: String ('all', 'first_order', 'specific_business')
businessId: UUID (optional)
isActive: Boolean (default true)
createdAt: DateTime
updatedAt: DateTime
```

### PromoUsage
```
id: UUID
promoCodeId: UUID (FK to PromoCode)
userId: UUID (FK to User)
orderId: UUID
discountAmount: Decimal(10,2)
usedAt: DateTime
```

---

## 🚀 Marketing Strategies

### Customer Acquisition
- First-order discounts (WELCOME20)
- Referral codes
- Social media promotions

### Customer Retention
- Loyalty rewards
- Birthday discounts
- Repeat customer offers

### Business Growth
- Flash sales
- Seasonal promotions
- Partnership codes

### Revenue Optimization
- Minimum order requirements
- Maximum discount caps
- Usage limits

---

## 📈 Analytics & Reporting

### Promo Statistics Include:
- Total usages
- Unique users
- Total discount given
- Average discount per use
- Remaining uses
- Active status
- Valid period

### Track Performance:
- Conversion rate
- Average order value with promo
- Customer acquisition cost
- ROI per promo campaign

---

**Promotions & Discounts system is complete and production-ready! 🎁**
