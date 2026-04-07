# Wallet Payment Methods - Backend Implementation TODO

## Current Status ✅

### **Frontend - COMPLETE**
- ✅ Payment method selector modal (Card, Bank Transfer, USSD)
- ✅ BankTransferScreen with account details UI
- ✅ USSDPaymentScreen with 6 Nigerian banks
- ✅ All screens have proper error handling and logging
- ✅ Non-serializable navigation params fixed
- ✅ Loading states during verification
- ✅ Web compatibility (showAlert instead of Alert.alert)

### **Backend - PARTIAL**
- ✅ Card payment (via Paystack) - WORKING
- ❌ Bank transfer (virtual accounts) - NOT IMPLEMENTED
- ❌ USSD payment - NOT IMPLEMENTED
- ❌ Payment webhooks - NOT IMPLEMENTED

---

## What Needs to Be Implemented 🚧

### **1. Paystack Dedicated Virtual Accounts**

**Purpose**: Give each user a permanent bank account number they can transfer to

**Paystack API**: `POST /dedicated_account`

**Backend Implementation Needed**:

```typescript
// backend/src/payment/paystack.service.ts

async createDedicatedVirtualAccount(userId: string, email: string, firstName: string, lastName: string) {
  const response = await axios.post(
    'https://api.paystack.co/dedicated_account',
    {
      customer: email,
      preferred_bank: 'wema-bank', // or 'titan-paystack'
      first_name: firstName,
      last_name: lastName,
    },
    {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    accountNumber: response.data.data.account_number,
    accountName: response.data.data.account_name,
    bankName: response.data.data.bank.name,
    bankCode: response.data.data.bank.code,
  };
}
```

**Database Schema Needed**:

```prisma
model VirtualAccount {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  accountNumber String   @unique
  accountName   String
  bankName      String
  bankCode      String
  paystackCustomerCode String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**New Endpoint**:

```typescript
// backend/src/payment/payment.controller.ts

@Get('virtual-account')
async getVirtualAccount(@Request() req: any) {
  return this.paymentService.getOrCreateVirtualAccount(req.user.sub);
}
```

**Frontend Update**:

```typescript
// frontend/src/screens/customer/BankTransferScreen.tsx

const fetchAccountDetails = async () => {
  try {
    const account = await api.get('/payment/virtual-account');
    setAccountDetails({
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      accountName: account.accountName,
    });
  } catch (error) {
    showAlert('Error', 'Failed to load account details');
  }
};
```

---

### **2. Paystack USSD Payment**

**Purpose**: Generate bank-specific USSD codes for payment

**Paystack API**: `POST /charge` with `ussd` channel

**Backend Implementation Needed**:

```typescript
// backend/src/payment/paystack.service.ts

async initializeUSSDPayment(amount: number, email: string, bankCode: string) {
  const response = await axios.post(
    'https://api.paystack.co/charge',
    {
      email,
      amount: amount * 100, // kobo
      currency: 'NGN',
      channel: 'ussd',
      bank: {
        code: bankCode, // e.g., '737' for GTBank
      },
    },
    {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    ussdCode: response.data.data.ussd_code,
    reference: response.data.data.reference,
  };
}
```

**Bank Codes**:
- GTBank: `737`
- Access Bank: `901`
- Zenith Bank: `966`
- UBA: `919`
- First Bank: `894`
- Stanbic IBTC: `909`

**New Endpoint**:

```typescript
// backend/src/payment/payment.controller.ts

@Post('ussd/generate')
async generateUSSDCode(
  @Request() req: any,
  @Body('amount') amount: number,
  @Body('bankCode') bankCode: string,
) {
  return this.paymentService.generateUSSDCode(req.user.sub, amount, bankCode);
}
```

**Frontend Update**:

```typescript
// frontend/src/screens/customer/USSDPaymentScreen.tsx

const generateCode = async (bankCode: string) => {
  try {
    const result = await api.post('/payment/ussd/generate', {
      amount,
      bankCode,
    });
    return result.ussdCode; // Real code from Paystack
  } catch (error) {
    showAlert('Error', 'Failed to generate USSD code');
  }
};
```

---

### **3. Payment Webhooks**

**Purpose**: Automatically credit wallet when payment is received

**Paystack Webhook Events**:
- `charge.success` - Payment successful
- `transfer.success` - Bank transfer received

**Backend Implementation Needed**:

```typescript
// backend/src/payment/payment.controller.ts

@Post('webhook')
async handleWebhook(@Request() req: any, @Body() payload: any) {
  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  const event = payload.event;
  const data = payload.data;

  switch (event) {
    case 'charge.success':
      await this.paymentService.handleSuccessfulCharge(data);
      break;
    case 'transfer.success':
      await this.paymentService.handleSuccessfulTransfer(data);
      break;
  }

  return { status: 'success' };
}
```

**Service Method**:

```typescript
// backend/src/payment/payment.service.ts

async handleSuccessfulCharge(data: any) {
  const metadata = data.metadata || {};
  
  if (metadata.type === 'wallet_topup') {
    const userId = metadata.userId;
    const amount = data.amount / 100; // kobo to naira

    // Credit wallet
    await this.prisma.digitalWallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });

    // Create transaction record
    await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: 'credit',
        amount,
        description: 'Wallet top-up',
        reference: data.reference,
        status: 'completed',
      },
    });

    console.log(`[WEBHOOK] Credited ${amount} to user ${userId}`);
  }
}
```

**Webhook URL Setup**:
1. Go to Paystack Dashboard → Settings → Webhooks
2. Add: `https://yourdomain.com/payment/webhook`
3. Copy webhook secret to `.env`: `PAYSTACK_WEBHOOK_SECRET=xxx`

---

### **4. Payment Status Polling (Alternative to Webhooks)**

**Purpose**: Check payment status periodically for bank transfer/USSD

**Backend Implementation**:

```typescript
// backend/src/payment/payment.service.ts

async checkPaymentStatus(reference: string) {
  const result = await this.paystackService.verifyPayment(reference);
  
  return {
    status: result.status, // 'success', 'pending', 'failed'
    amount: result.amount / 100,
    paidAt: result.paid_at,
    channel: result.channel, // 'card', 'bank_transfer', 'ussd'
  };
}
```

**New Endpoint**:

```typescript
// backend/src/payment/payment.controller.ts

@Get('status/:reference')
async checkPaymentStatus(@Param('reference') reference: string) {
  return this.paymentService.checkPaymentStatus(reference);
}
```

**Frontend Polling**:

```typescript
// frontend/src/screens/customer/BankTransferScreen.tsx

const pollPaymentStatus = async () => {
  const interval = setInterval(async () => {
    try {
      const status = await api.get(`/payment/status/${reference}`);
      if (status.status === 'success') {
        clearInterval(interval);
        showAlert('Success!', 'Payment received! Wallet credited.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 5000); // Check every 5 seconds

  // Stop after 5 minutes
  setTimeout(() => clearInterval(interval), 300000);
};
```

---

## Implementation Priority 🎯

### **Phase 1: Virtual Accounts** (Highest Priority)
1. Add VirtualAccount model to Prisma schema
2. Implement `createDedicatedVirtualAccount` in PaystackService
3. Add `GET /payment/virtual-account` endpoint
4. Update BankTransferScreen to fetch real account
5. Test with real Paystack account

### **Phase 2: Webhooks** (Critical for Auto-Credit)
1. Add webhook endpoint
2. Implement signature verification
3. Handle `charge.success` event
4. Handle `transfer.success` event
5. Configure webhook URL in Paystack dashboard
6. Test with Paystack webhook tester

### **Phase 3: USSD** (Nice to Have)
1. Implement USSD code generation
2. Add `POST /payment/ussd/generate` endpoint
3. Update USSDPaymentScreen to fetch real codes
4. Test with real bank USSD

### **Phase 4: Polling** (Fallback)
1. Add payment status endpoint
2. Implement polling in frontend
3. Add timeout and error handling

---

## Testing Checklist ✅

### **Virtual Accounts**
- [ ] Create virtual account for new user
- [ ] Retrieve existing virtual account
- [ ] Transfer to account number
- [ ] Verify wallet credited via webhook
- [ ] Check transaction history

### **USSD**
- [ ] Generate USSD code for GTBank
- [ ] Generate USSD code for other banks
- [ ] Dial code and complete payment
- [ ] Verify wallet credited
- [ ] Check transaction history

### **Webhooks**
- [ ] Webhook signature verification works
- [ ] charge.success credits wallet
- [ ] transfer.success credits wallet
- [ ] Invalid signatures rejected
- [ ] Duplicate webhooks handled

---

## Current Workarounds 🔧

Until backend is implemented, the frontend:
- ✅ Shows mock account details (hardcoded)
- ✅ Shows mock USSD codes (hardcoded)
- ✅ Simulates verification (2-second delay)
- ✅ Shows appropriate messages
- ✅ Logs all actions for debugging

**Everything works for UI/UX testing, just needs real backend integration!**

---

## Documentation Links 📚

- [Paystack Dedicated Accounts](https://paystack.com/docs/payments/dedicated-virtual-accounts)
- [Paystack USSD](https://paystack.com/docs/payments/ussd)
- [Paystack Webhooks](https://paystack.com/docs/payments/webhooks)
- [Paystack API Reference](https://paystack.com/docs/api)

---

## Estimated Implementation Time ⏱️

- **Virtual Accounts**: 2-3 hours
- **Webhooks**: 1-2 hours
- **USSD**: 1-2 hours
- **Polling**: 1 hour
- **Testing**: 2-3 hours

**Total**: ~8-12 hours of development work
