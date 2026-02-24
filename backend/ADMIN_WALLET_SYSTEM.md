# 💰 Admin Wallet Management System

## Overview

The Admin Wallet Management System allows authorized administrators to manage user wallet balances with comprehensive security features, audit logging, and approval workflows.

---

## 🔐 Security Features

### 1. Role-Based Permissions
```
Admin Roles & Credit Limits:
├── admin          → ₦5,000 (requires approval above)
├── super_admin    → ₦50,000 (requires approval above)
└── finance        → ₦1,000,000 (unlimited)
```

### 2. Approval Workflow
- **Direct Credit**: Amounts within admin's limit
- **Pending Approval**: Amounts exceeding admin's limit
- **Two-Step Approval**: Super Admin or Finance team must approve

### 3. Audit Trail
Every wallet action is logged with:
- Admin who performed the action
- User affected
- Amount and reason
- IP address and user agent
- Timestamp
- Before/after balances
- Approval chain (if applicable)

---

## 📡 API Endpoints

### Base URL: `/admin/wallets`

All endpoints require:
- JWT authentication
- Admin role (`admin`, `super_admin`, or `finance`)

---

### 1. Credit User Wallet

**Endpoint:** `POST /admin/wallets/credit`

**Required Role:** `admin`, `super_admin`, `finance`

**Request Body:**
```json
{
  "userId": "uuid-of-user",
  "amount": 5000,
  "reason": "Compensation for late delivery - Order #FUL-2026-123",
  "reference": "COMP-2026-001" // optional
}
```

**Response (Direct Credit):**
```json
{
  "success": true,
  "requiresApproval": false,
  "wallet": {
    "id": "wallet-uuid",
    "previousBalance": "10000",
    "newBalance": "15000",
    "credited": 5000
  },
  "message": "Successfully credited ₦5,000 to user's wallet"
}
```

**Response (Requires Approval):**
```json
{
  "success": true,
  "requiresApproval": true,
  "actionId": "audit-log-uuid",
  "message": "Credit request for ₦50,000 requires approval from Super Admin"
}
```

---

### 2. Debit User Wallet

**Endpoint:** `POST /admin/wallets/debit`

**Required Role:** `admin`, `super_admin`, `finance`

**Request Body:**
```json
{
  "userId": "uuid-of-user",
  "amount": 2000,
  "reason": "Refund reversal - Duplicate refund issued",
  "reference": "REV-2026-001" // optional
}
```

**Response:** Same structure as credit endpoint

**Note:** Debit always requires approval for security

---

### 3. Approve Pending Action

**Endpoint:** `POST /admin/wallets/approve`

**Required Role:** `super_admin`, `finance`

**Request Body:**
```json
{
  "actionId": "audit-log-uuid",
  "notes": "Approved after verification with customer support ticket #1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Action approved and wallet credited successfully",
  "wallet": {
    "id": "wallet-uuid",
    "balance": "60000",
    "currency": "NGN"
  }
}
```

---

### 4. Reject Pending Action

**Endpoint:** `POST /admin/wallets/reject`

**Required Role:** `super_admin`, `finance`

**Request Body:**
```json
{
  "actionId": "audit-log-uuid",
  "reason": "Insufficient documentation - customer support ticket not found"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Action rejected successfully"
}
```

---

### 5. Get Pending Actions

**Endpoint:** `GET /admin/wallets/pending-actions`

**Required Role:** `super_admin`, `finance`

**Response:**
```json
[
  {
    "id": "audit-log-uuid",
    "action": "wallet_credit_pending",
    "userId": "user-uuid",
    "user": {
      "email": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "admin": {
      "user": {
        "email": "admin@fulccrum.com",
        "firstName": "Jane"
      }
    },
    "changes": {
      "amount": 50000,
      "reason": "Compensation for service issue",
      "currentBalance": "10000"
    },
    "createdAt": "2026-02-24T10:00:00Z"
  }
]
```

---

### 6. Get User Wallet

**Endpoint:** `GET /admin/wallets/user/:userId`

**Required Role:** `admin`, `super_admin`, `finance`

**Response:**
```json
{
  "id": "wallet-uuid",
  "userId": "user-uuid",
  "balance": "50000",
  "pendingBalance": "0",
  "frozenBalance": "0",
  "currency": "NGN",
  "isActive": true,
  "user": {
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer"
  }
}
```

---

### 7. Get Wallet Audit Log

**Endpoint:** `GET /admin/wallets/user/:userId/audit-log?page=1&limit=20`

**Required Role:** `admin`, `super_admin`, `finance`

**Response:**
```json
{
  "data": [
    {
      "id": "audit-uuid",
      "action": "wallet_credited",
      "resource": "wallet",
      "status": "success",
      "changes": {
        "amount": 5000,
        "reason": "Compensation for late delivery",
        "previousBalance": "10000",
        "newBalance": "15000"
      },
      "admin": {
        "user": {
          "email": "admin@fulccrum.com",
          "firstName": "Jane"
        }
      },
      "ipAddress": "192.168.1.1",
      "createdAt": "2026-02-24T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## 🎯 Use Cases

### Use Case 1: Compensation for Service Issue

**Scenario:** Customer's order was 2 hours late and arrived cold

**Steps:**
1. Customer support receives complaint
2. Admin logs into admin panel
3. Admin credits ₦2,000 to customer's wallet
4. Reason: "Compensation for late delivery - Order #FUL-2026-123"
5. Customer receives notification
6. Credit appears in audit log

**API Call:**
```bash
POST /admin/wallets/credit
{
  "userId": "customer-uuid",
  "amount": 2000,
  "reason": "Compensation for late delivery - Order #FUL-2026-123"
}
```

---

### Use Case 2: Failed Payment Recovery

**Scenario:** User paid ₦10,000 via bank transfer but wallet wasn't credited due to payment gateway glitch

**Steps:**
1. User contacts support with payment receipt
2. Support verifies payment in bank statement
3. Admin credits ₦10,000 to user's wallet
4. Reference: Payment transaction ID
5. User can now use wallet balance

**API Call:**
```bash
POST /admin/wallets/credit
{
  "userId": "customer-uuid",
  "amount": 10000,
  "reason": "Manual credit - Payment gateway failed to process",
  "reference": "TXN-2026-ABC123"
}
```

---

### Use Case 3: Large Amount Requiring Approval

**Scenario:** Restaurant owner claims ₦100,000 was incorrectly deducted

**Steps:**
1. Admin (regular) attempts to credit ₦100,000
2. System creates pending approval request
3. Super Admin receives notification
4. Super Admin reviews case and supporting documents
5. Super Admin approves the credit
6. Wallet is credited and both admins are logged

**API Calls:**
```bash
# Step 1: Admin creates request
POST /admin/wallets/credit
{
  "userId": "restaurant-owner-uuid",
  "amount": 100000,
  "reason": "Refund for incorrect commission deduction"
}

# Response: requiresApproval: true, actionId: "xyz"

# Step 2: Super Admin approves
POST /admin/wallets/approve
{
  "actionId": "xyz",
  "notes": "Verified with finance team - commission calculation error confirmed"
}
```

---

## 🔒 Security Best Practices

### 1. Always Provide Detailed Reasons
```
❌ Bad: "Credit wallet"
✅ Good: "Compensation for late delivery - Order #FUL-2026-123"
```

### 2. Use Reference Numbers
```
✅ Link to support tickets
✅ Link to payment transaction IDs
✅ Link to order numbers
```

### 3. Verify Before Large Credits
```
For amounts > ₦10,000:
1. Verify user identity
2. Check supporting documents
3. Confirm with manager
4. Document verification in notes
```

### 4. Monitor Audit Logs
```
Regular reviews:
- Daily: Check all wallet credits > ₦50,000
- Weekly: Review all admin actions
- Monthly: Analyze patterns for fraud
```

---

## 📊 Audit Log Actions

| Action | Description | Who Can Perform |
|--------|-------------|-----------------|
| `wallet_credited` | Wallet balance increased | Admin, Super Admin, Finance |
| `wallet_debited` | Wallet balance decreased | Admin, Super Admin, Finance |
| `wallet_credit_pending` | Credit request awaiting approval | Admin |
| `wallet_debit_pending` | Debit request awaiting approval | Admin |
| `approved` | Pending action approved | Super Admin, Finance |
| `rejected` | Pending action rejected | Super Admin, Finance |

---

## 🧪 Testing with Seed Data

All seeded users have wallets with test balances:

```
Admin:
  Email: admin@fulccrum.com
  Wallet: ₦1,000,000

Customers:
  customer1@test.com → ₦50,000
  customer2@test.com → ₦30,000
  customer3@test.com → ₦20,000

Drivers:
  driver1@test.com → ₦15,000
  driver2@test.com → ₦10,000

Restaurant Owners:
  pizza@test.com → ₦100,000
  burger@test.com → ₦75,000
  jollof@test.com → ₦50,000
```

### Test Scenarios:

**1. Test Direct Credit (Within Limit):**
```bash
POST /admin/wallets/credit
{
  "userId": "<customer1-uuid>",
  "amount": 3000,
  "reason": "Test credit - Service compensation"
}
# Should succeed immediately
```

**2. Test Approval Workflow (Exceeds Limit):**
```bash
POST /admin/wallets/credit
{
  "userId": "<customer1-uuid>",
  "amount": 60000,
  "reason": "Test large credit - Requires approval"
}
# Should create pending action
```

**3. Test Insufficient Balance Debit:**
```bash
POST /admin/wallets/debit
{
  "userId": "<customer3-uuid>",
  "amount": 50000,
  "reason": "Test debit"
}
# Should fail - customer3 only has ₦20,000
```

---

## 🚨 Error Handling

### Common Errors:

**1. User Not Found**
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

**2. Wallet Not Found**
```json
{
  "statusCode": 404,
  "message": "Wallet not found"
}
```

**3. Insufficient Balance**
```json
{
  "statusCode": 400,
  "message": "Insufficient wallet balance"
}
```

**4. Insufficient Permissions**
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions to approve this action"
}
```

**5. Action Already Processed**
```json
{
  "statusCode": 400,
  "message": "Action already processed"
}
```

---

## 📈 Future Enhancements

### Planned Features:
- [ ] Bulk wallet credits (CSV upload)
- [ ] Scheduled wallet credits (recurring bonuses)
- [ ] Wallet freeze/unfreeze functionality
- [ ] Real-time notifications to users
- [ ] Export audit logs to CSV
- [ ] Advanced fraud detection
- [ ] Wallet balance alerts
- [ ] Multi-currency support

---

## 🔗 Related Documentation

- [Seed Data Guide](./SEED_DATA_GUIDE.md)
- [Admin System Overview](./admin/README.md)
- [Audit Logging](./AUDIT_SYSTEM.md)
- [Payment Integration](./PAYMENT_INTEGRATION.md)

---

## 📞 Support

For issues or questions about the admin wallet system:
- Technical: dev@fulccrum.com
- Security: security@fulccrum.com
- Finance: finance@fulccrum.com
