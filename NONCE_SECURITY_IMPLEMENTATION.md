# Nonce Security & Supply Chain Implementation

## ✅ Completed Implementation

### **1. Nonce Security System**

#### **What is a Nonce?**
A nonce (Number used ONCE) is a cryptographic token that prevents replay attacks. Each sensitive operation requires a fresh nonce that can only be used once.

#### **Backend (Already Implemented)**
- Redis-based nonce service with 5-minute TTL
- Nonce validation guard for protected endpoints
- Automatic nonce consumption after use

**Protected Endpoints:**
- `POST /payment/initialize` - Requires `payment` nonce
- `POST /wallet/withdraw/request` - Requires `withdraw` nonce
- `POST /wallet/bank-accounts` - Requires `bank-account` nonce
- `POST /payment/cards` - Requires `card-save` nonce

#### **Frontend (Just Implemented)**

**Files Created/Modified:**
1. ✅ `frontend/src/services/nonceService.ts` - Nonce management service
2. ✅ `frontend/src/services/api.ts` - Added nonce API and automatic injection

**How It Works:**
```typescript
// 1. Get nonce for action
const nonce = await nonceService.getNonce('payment');

// 2. Nonce is automatically added to request headers
// The api.ts interceptor handles this automatically for protected endpoints

// 3. After successful use, nonce is consumed (single-use)
nonceService.clearNonce('payment');
```

**Automatic Nonce Injection:**
The `request()` function in `api.ts` automatically:
- Detects protected endpoints
- Fetches appropriate nonce
- Adds `X-Nonce` header
- Caches nonces for 4 minutes (backend TTL is 5 minutes)

**Valid Actions:**
- `withdraw` - For wallet withdrawals
- `payment` - For payment initialization
- `transfer` - For fund transfers
- `bank-account` - For adding bank accounts
- `card-save` - For saving payment cards

---

### **2. Enhanced Supply Chain Blockchain**

#### **Backend Features (Already Implemented)**
- Blockchain-inspired hash chain for immutability
- Supply chain entry tracking with verification
- Chain integrity validation
- Temperature tracking for cold chain items

**New Endpoints:**
- `POST /blockchain/supply-chain` - Add supply chain entry
- `POST /blockchain/supply-chain/:entryId/verify` - Verify entry
- `GET /blockchain/supply-chain/:itemId/integrity` - Verify chain integrity
- `GET /blockchain/supply-chains/business` - Get business supply chains

#### **Frontend (Just Implemented)**

**Files Created:**
1. ✅ `frontend/src/screens/merchant/AddSupplyChainEntryScreen.tsx` - Entry form

**Files Modified:**
1. ✅ `frontend/src/services/api.ts` - Added supply chain endpoints
2. ✅ `frontend/src/navigation/MerchantNavigator.tsx` - Added route
3. ✅ `frontend/src/screens/merchant/SupplyChainScreen.tsx` - Added entry button

**Supply Chain Stages:**
- 🌱 **Sourced** - Raw materials obtained
- 🔧 **Processed** - Materials processed
- 📦 **Stored** - Items in storage
- 🍳 **Prepared** - Food prepared
- 🚗 **Dispatched** - Order dispatched
- ✅ **Delivered** - Order delivered

**Features:**
- Track each stage of food supply chain
- Record handler, location, description
- Optional temperature tracking (cold chain)
- Optional batch number tracking
- Blockchain-inspired immutability

---

## 🔧 **How to Use**

### **For Merchants - Add Supply Chain Entry**

1. Navigate to **Settings** → **Supply Chain**
2. Click the **+** button in header
3. Select menu item (or comes from item detail)
4. Choose stage (Sourced, Processed, etc.)
5. Enter:
   - Location (e.g., "Farm ABC, Lagos")
   - Handler (e.g., "John Doe")
   - Description
   - Temperature (optional, for cold chain)
   - Batch Number (optional)
6. Click **Add Entry**

### **For Developers - Using Nonce in Custom Screens**

```typescript
import { nonceService } from '../services/nonceService';

// Example: Custom payment flow
const makePayment = async () => {
  try {
    // Nonce is automatically added by api.ts interceptor
    // You don't need to manually add it!
    const result = await paymentAPI.initialize(orderId, amount);
    
    // Success - nonce was automatically used
    console.log('Payment initialized:', result);
  } catch (error) {
    // If nonce error, it will be in error message
    console.error('Payment failed:', error);
  }
};

// Manual nonce usage (if needed)
const manualNonceExample = async () => {
  const nonce = await nonceService.getNonce('payment');
  
  // Use nonce in custom API call
  const response = await fetch('/custom-endpoint', {
    headers: {
      'X-Nonce': nonce,
      'Authorization': `Bearer ${token}`,
    },
  });
  
  // Clear nonce after successful use
  if (response.ok) {
    nonceService.clearNonce('payment');
  }
};
```

---

## 🧪 **Testing**

### **Test Nonce Security**

1. **Test Payment with Nonce:**
   - Go to checkout
   - Make a payment
   - Check console for `[API] Added nonce for payment`
   - Payment should succeed

2. **Test Without Nonce (Should Fail):**
   - Manually call payment API without nonce
   - Should get 400 error: "Nonce is required"

3. **Test Nonce Expiry:**
   - Get a nonce
   - Wait 6 minutes
   - Try to use it
   - Should get 400 error: "Invalid or expired nonce"

### **Test Supply Chain**

1. **Add Entry:**
   - Go to Supply Chain screen
   - Click + button
   - Fill form and submit
   - Entry should appear in list

2. **Verify Chain Integrity:**
   - Add multiple entries for same item
   - Check that hash chain is maintained
   - Verify entries show in correct order

---

## 📊 **Database Schema**

### **SupplyChainEntry Model**
```prisma
model SupplyChainEntry {
  id           String   @id @default(uuid())
  menuItemId   String
  businessId   String
  
  // Blockchain fields
  blockIndex   Int
  previousHash String
  currentHash  String
  
  // Supply chain data
  stage        String   // sourced, processed, stored, prepared, dispatched, delivered
  location     String
  handler      String
  description  String
  temperature  String?
  batchNumber  String?
  
  // Verification
  verified     Boolean  @default(false)
  verifiedBy   String?
  verifiedAt   DateTime?
  certificate  String?
  
  metadata     Json     @default("{}")
  timestamp    DateTime @default(now())
}
```

---

## 🚀 **Next Steps**

### **Immediate:**
1. ✅ Nonce security implemented
2. ✅ Supply chain entry form created
3. ⏳ Test payment flows with nonce
4. ⏳ Test supply chain entry creation

### **Future Enhancements:**
1. Add supply chain verification UI
2. Show chain integrity status
3. Add QR code scanning for verification
4. Customer-facing supply chain transparency
5. Carbon footprint calculation per stage

---

## 🔒 **Security Notes**

**Nonce Best Practices:**
- ✅ Nonces expire after 5 minutes
- ✅ Each nonce can only be used once
- ✅ Nonces are tied to specific user and action
- ✅ Nonces are cleared on logout
- ✅ Failed operations don't consume nonce

**Supply Chain Security:**
- ✅ Hash chain prevents tampering
- ✅ Each entry references previous hash
- ✅ Verification system for authenticity
- ✅ Immutable once created

---

## 📝 **API Reference**

### **Nonce API**
```typescript
// Get nonce
GET /nonce/:action
Response: { nonce, action, expiresIn: 300, message }

// Use nonce (automatic via X-Nonce header)
POST /payment/initialize
Headers: { X-Nonce: "timestamp-randomhex" }
```

### **Supply Chain API**
```typescript
// Add entry
POST /blockchain/supply-chain
Body: {
  itemId: string,
  stage: string,
  location: string,
  handler: string,
  description: string,
  temperature?: string,
  batchNumber?: string
}

// Verify entry
POST /blockchain/supply-chain/:entryId/verify

// Check integrity
GET /blockchain/supply-chain/:itemId/integrity

// Get business chains
GET /blockchain/supply-chains/business
```

---

## ✅ **Implementation Checklist**

- [x] Create nonce API endpoints
- [x] Create NonceService
- [x] Add nonce interceptor to api.ts
- [x] Update clearTokens to clear nonces
- [x] Add supply chain endpoints to blockchainAPI
- [x] Create AddSupplyChainEntry screen
- [x] Register screen in navigator
- [x] Add entry button to SupplyChain screen
- [ ] Test payment with nonce
- [ ] Test withdrawal with nonce
- [ ] Test supply chain entry creation
- [ ] Test chain integrity verification

---

**Implementation Date:** March 8, 2026  
**Status:** ✅ Complete - Ready for Testing
