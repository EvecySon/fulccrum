# Automatic Fee Calculation System - Complete Guide

## 🎉 Distance-Based Delivery & Fee Calculation Implemented!

Complete automatic fee calculation system with distance-based delivery fees, service charges, and tax calculations. Admin-configurable settings for all platform fees.

---

## 📊 What's Been Implemented

### Database Model
**PlatformSettings** - Admin-configurable fee structure:
- Delivery fee configuration (base fee, per-km rate, min/max)
- Service fee configuration (percentage, min/max)
- Tax configuration (VAT percentage)
- Platform commission
- Free delivery threshold

### API Endpoints (3)

#### Customer (1)
- `POST /fees/calculate` - Preview order fees before checkout

#### Admin (2)
- `GET /fees/settings` - Get current fee settings
- `POST /fees/settings` - Update fee configuration

---

## 🧪 How It Works

### 1. Distance-Based Delivery Fee Calculation

**Formula:**
```
deliveryFee = baseDeliveryFee + (distance × perKmRate)
```

**With Limits:**
```
if (deliveryFee < minDeliveryFee) deliveryFee = minDeliveryFee
if (deliveryFee > maxDeliveryFee) deliveryFee = maxDeliveryFee
```

**Example:**
- Business location: Ikeja, Lagos (6.6018°N, 3.3515°E)
- Customer location: Victoria Island, Lagos (6.4281°N, 3.4219°E)
- Distance: ~20 km
- Base fee: ₦200
- Per-km rate: ₦50
- **Calculation:** ₦200 + (20 × ₦50) = ₦1,200

### 2. Service Fee Calculation

**Formula:**
```
serviceFee = subtotal × (serviceFeePercentage / 100)
```

**With Limits:**
```
if (serviceFee < minServiceFee) serviceFee = minServiceFee
if (serviceFee > maxServiceFee) serviceFee = maxServiceFee
```

**Example:**
- Subtotal: ₦5,000
- Service fee: 5%
- **Calculation:** ₦5,000 × 0.05 = ₦250

### 3. Tax Calculation (VAT)

**Formula:**
```
taxAmount = subtotal × (taxPercentage / 100)
```

**Example:**
- Subtotal: ₦5,000
- VAT: 7.5%
- **Calculation:** ₦5,000 × 0.075 = ₦375

### 4. Total Order Calculation

```
total = subtotal + deliveryFee + serviceFee + taxAmount - discountAmount + tipAmount
```

---

## 🧪 Testing Fee Calculation

### 1. Get Current Fee Settings

```bash
GET http://localhost:3001/fees/settings
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "settings-uuid",
  "baseDeliveryFee": 200,
  "perKmRate": 50,
  "minDeliveryFee": 200,
  "maxDeliveryFee": 2000,
  "freeDeliveryThreshold": 10000,
  "serviceFeePercentage": 5,
  "minServiceFee": 50,
  "maxServiceFee": 500,
  "taxPercentage": 7.5,
  "taxName": "VAT",
  "platformCommissionPercentage": 15,
  "currency": "NGN",
  "isActive": true,
  "createdAt": "2026-02-07T00:00:00.000Z",
  "updatedAt": "2026-02-07T00:00:00.000Z"
}
```

### 2. Update Fee Settings (Admin Only)

```bash
POST http://localhost:3001/fees/settings
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "baseDeliveryFee": 250,
  "perKmRate": 60,
  "minDeliveryFee": 250,
  "maxDeliveryFee": 2500,
  "freeDeliveryThreshold": 15000,
  "serviceFeePercentage": 6,
  "minServiceFee": 75,
  "maxServiceFee": 600,
  "taxPercentage": 7.5,
  "taxName": "VAT",
  "platformCommissionPercentage": 18,
  "currency": "NGN"
}
```

### 3. Calculate Order Fees (Customer Preview)

```bash
POST http://localhost:3001/fees/calculate
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "businessId": "business-uuid",
  "customerAddressId": "address-uuid",
  "subtotal": 5000,
  "promoCode": "WELCOME20"
}
```

**Response:**
```json
{
  "subtotal": 5000,
  "deliveryFee": 1200,
  "serviceFee": 250,
  "taxAmount": 375,
  "taxName": "VAT",
  "taxPercentage": 7.5,
  "discountAmount": 1000,
  "total": 5825,
  "distance": 20.5,
  "currency": "NGN",
  "breakdown": {
    "baseDeliveryFee": 200,
    "perKmRate": 50,
    "distanceCharge": 1025,
    "serviceFeePercentage": 5,
    "freeDeliveryApplied": false
  }
}
```

---

## 📱 Mobile App Integration

### React Native - Fee Preview at Checkout

```javascript
import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const CheckoutScreen = ({ cart, businessId, deliveryAddressId }) => {
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateFees();
  }, [cart, deliveryAddressId]);

  const calculateFees = async () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      const response = await fetch('http://api.fulccrum.com/fees/calculate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          customerAddressId: deliveryAddressId,
          subtotal,
          promoCode: appliedPromoCode,
        }),
      });

      const data = await response.json();
      setFees(data);
    } catch (error) {
      console.error('Error calculating fees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>

      <View style={styles.row}>
        <Text>Subtotal</Text>
        <Text>₦{fees.subtotal.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text>Delivery Fee ({fees.distance} km)</Text>
        <Text>₦{fees.deliveryFee.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text>Service Fee ({fees.breakdown.serviceFeePercentage}%)</Text>
        <Text>₦{fees.serviceFee.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text>{fees.taxName} ({fees.taxPercentage}%)</Text>
        <Text>₦{fees.taxAmount.toFixed(2)}</Text>
      </View>

      {fees.discountAmount > 0 && (
        <View style={styles.row}>
          <Text style={styles.discount}>Discount</Text>
          <Text style={styles.discount}>-₦{fees.discountAmount.toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>₦{fees.total.toFixed(2)}</Text>
      </View>

      {fees.breakdown.freeDeliveryApplied && (
        <Text style={styles.freeDelivery}>🎉 Free delivery applied!</Text>
      )}

      <Button title="Place Order" onPress={() => placeOrder(fees)} />
    </View>
  );
};
```

---

## ⚙️ Default Fee Configuration

When the system starts, default settings are created:

```javascript
{
  baseDeliveryFee: 200,        // ₦200 base fee
  perKmRate: 50,               // ₦50 per kilometer
  minDeliveryFee: 200,         // Minimum ₦200
  maxDeliveryFee: 2000,        // Maximum ₦2000
  freeDeliveryThreshold: null, // No free delivery by default
  serviceFeePercentage: 5,     // 5% service fee
  minServiceFee: 50,           // Minimum ₦50
  maxServiceFee: null,         // No maximum
  taxPercentage: 7.5,          // 7.5% VAT
  taxName: 'VAT',
  platformCommissionPercentage: 15, // 15% platform commission
  currency: 'NGN'
}
```

---

## 🎯 Admin Configuration Options

### Delivery Fee Settings

**Base Delivery Fee:**
- Starting fee for all deliveries
- Example: ₦200

**Per-Kilometer Rate:**
- Additional charge per km
- Example: ₦50/km

**Minimum Delivery Fee:**
- Lowest possible delivery fee
- Example: ₦200

**Maximum Delivery Fee:**
- Cap on delivery charges
- Example: ₦2000

**Free Delivery Threshold:**
- Order amount for free delivery
- Example: ₦10,000 (orders above this get free delivery)

### Service Fee Settings

**Service Fee Percentage:**
- Platform service charge
- Example: 5% of subtotal

**Minimum Service Fee:**
- Lowest service charge
- Example: ₦50

**Maximum Service Fee:**
- Cap on service charge
- Example: ₦500

### Tax Settings

**Tax Percentage:**
- VAT or sales tax
- Example: 7.5% (Nigeria VAT)

**Tax Name:**
- Display name for tax
- Example: "VAT", "Sales Tax"

### Platform Commission

**Commission Percentage:**
- Platform's cut from business
- Example: 15%

---

## 🔄 Fee Calculation Flow

### Customer Journey:

1. **Browse Menu** → Select items
2. **Add to Cart** → Calculate subtotal
3. **Select Delivery Address** → Get GPS coordinates
4. **Preview Fees** → Call `/fees/calculate`
   - System calculates distance from business
   - Applies delivery fee formula
   - Calculates service fee and tax
   - Returns complete breakdown
5. **Apply Promo Code** (optional) → Recalculate
6. **Place Order** → Create order with calculated fees

---

## 💡 Smart Features

### 1. Free Delivery
If order subtotal ≥ freeDeliveryThreshold:
```
deliveryFee = 0
```

### 2. Distance-Based Pricing
Closer customers pay less:
- 5 km away: ₦200 + (5 × ₦50) = ₦450
- 20 km away: ₦200 + (20 × ₦50) = ₦1,200

### 3. Fee Caps
Prevents excessive charges:
- Delivery fee capped at ₦2,000
- Service fee capped at ₦500 (if configured)

### 4. Minimum Fees
Ensures platform sustainability:
- Minimum delivery fee: ₦200
- Minimum service fee: ₦50

---

## 📊 Example Scenarios

### Scenario 1: Short Distance Order
- Subtotal: ₦3,000
- Distance: 5 km
- Delivery: ₦200 + (5 × ₦50) = ₦450 (but min is ₦200, so ₦450)
- Service: ₦3,000 × 5% = ₦150
- Tax: ₦3,000 × 7.5% = ₦225
- **Total: ₦3,825**

### Scenario 2: Long Distance Order
- Subtotal: ₦5,000
- Distance: 30 km
- Delivery: ₦200 + (30 × ₦50) = ₦1,700
- Service: ₦5,000 × 5% = ₦250
- Tax: ₦5,000 × 7.5% = ₦375
- **Total: ₦7,325**

### Scenario 3: Free Delivery Order
- Subtotal: ₦12,000
- Distance: 15 km
- Delivery: ₦0 (free delivery threshold met)
- Service: ₦12,000 × 5% = ₦600 (capped at ₦500)
- Tax: ₦12,000 × 7.5% = ₦900
- **Total: ₦13,400**

### Scenario 4: With Promo Code
- Subtotal: ₦5,000
- Distance: 10 km
- Delivery: ₦200 + (10 × ₦50) = ₦700
- Service: ₦5,000 × 5% = ₦250
- Tax: ₦5,000 × 7.5% = ₦375
- Discount: -₦1,000 (20% off promo)
- **Total: ₦5,325**

---

## 🔒 Security & Validation

### Address Validation
- ✅ Business address must have GPS coordinates
- ✅ Customer address must have GPS coordinates
- ✅ Addresses must exist in database

### Fee Validation
- ✅ All fees are positive numbers
- ✅ Minimum and maximum limits enforced
- ✅ Calculations rounded to 2 decimal places

### Admin Authorization
- ✅ Only admins can update fee settings
- ✅ Settings versioned (old settings deactivated)
- ✅ Always one active settings record

---

## 🚀 Benefits

### For Customers
- ✅ Transparent pricing before checkout
- ✅ Fair distance-based delivery fees
- ✅ Free delivery incentive for large orders
- ✅ Clear fee breakdown

### For Businesses
- ✅ Predictable commission structure
- ✅ Competitive delivery pricing
- ✅ Automatic fee calculation

### For Platform
- ✅ Flexible fee configuration
- ✅ Revenue optimization
- ✅ Market-responsive pricing
- ✅ Easy fee adjustments

---

## 📝 Database Schema

```
PlatformSettings:
  id: UUID
  baseDeliveryFee: Decimal(10,2) - default 200
  perKmRate: Decimal(10,2) - default 50
  minDeliveryFee: Decimal(10,2) - default 200
  maxDeliveryFee: Decimal(10,2) - default 2000
  freeDeliveryThreshold: Decimal(10,2) - optional
  serviceFeePercentage: Decimal(5,2) - default 5
  minServiceFee: Decimal(10,2) - default 50
  maxServiceFee: Decimal(10,2) - optional
  taxPercentage: Decimal(5,2) - default 7.5
  taxName: String - default "VAT"
  platformCommissionPercentage: Decimal(5,2) - default 15
  currency: String - default "NGN"
  isActive: Boolean - default true
  createdAt: DateTime
  updatedAt: DateTime
```

---

**Automatic Fee Calculation system is complete and production-ready! 💰**

All fees are now calculated automatically based on distance and admin-configured rates!
