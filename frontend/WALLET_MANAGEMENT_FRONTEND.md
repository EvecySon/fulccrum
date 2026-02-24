# 💰 Frontend Wallet Management - Implementation Guide

## Overview

This document outlines the frontend components needed to integrate with the Admin Wallet Management System. The backend APIs are already built and documented in `backend/ADMIN_WALLET_SYSTEM.md`.

---

## 🎯 What Needs to Be Built

### **1. Wallet Management Screen** (New - Priority: HIGH)
**File:** `frontend/src/screens/admin/WalletManagementScreen.tsx`

**Purpose:** Central hub for all wallet operations

**Features Required:**
- [ ] Search users by email/name/phone
- [ ] Display user wallet balances in a list
- [ ] Credit wallet modal/form
- [ ] Debit wallet modal/form
- [ ] View pending approvals (for Super Admin/Finance)
- [ ] Approve/reject pending actions
- [ ] View wallet audit log for selected user

**UI Layout:**
```
┌─────────────────────────────────────────────┐
│  💰 Wallet Management                       │
├─────────────────────────────────────────────┤
│  🔍 Search: [___________________] [Search]  │
│                                             │
│  📊 User Wallets:                           │
│  ┌───────────────────────────────────────┐ │
│  │ John Doe (customer1@test.com)         │ │
│  │ Balance: ₦50,000                      │ │
│  │ [Credit] [Debit] [View History]      │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ Jane Smith (customer2@test.com)       │ │
│  │ Balance: ₦30,000                      │ │
│  │ [Credit] [Debit] [View History]      │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ⏳ Pending Approvals: (2)                  │
│  ┌───────────────────────────────────────┐ │
│  │ Credit ₦60,000 to John Doe            │ │
│  │ Reason: Compensation for issue        │ │
│  │ Requested by: admin@fulccrum.com      │ │
│  │ [Approve] [Reject]                    │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

### **2. Credit Wallet Modal** (New - Priority: HIGH)
**Component:** `frontend/src/components/admin/CreditWalletModal.tsx`

**Props:**
```typescript
interface CreditWalletModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentBalance: number;
  onSuccess: () => void;
}
```

**Form Fields:**
- Amount (number input, required, min: 1, max: 1,000,000)
- Reason (text input, required, min: 10 characters)
- Reference (text input, optional)

**Validation:**
- Amount must be positive number
- Reason must be descriptive (at least 10 characters)
- Show warning if amount > ₦50,000 (requires approval)

**UI:**
```
┌─────────────────────────────────────┐
│  💰 Credit Wallet                   │
├─────────────────────────────────────┤
│  User: John Doe                     │
│  Current Balance: ₦50,000           │
│                                     │
│  Amount: [_____________] ₦          │
│                                     │
│  Reason: [_____________________]    │
│          [_____________________]    │
│                                     │
│  Reference (optional):              │
│          [_____________________]    │
│                                     │
│  ⚠️  Amounts over ₦50,000 require   │
│      Super Admin approval           │
│                                     │
│  [Cancel]  [Credit Wallet]          │
└─────────────────────────────────────┘
```

---

### **3. Debit Wallet Modal** (New - Priority: MEDIUM)
**Component:** `frontend/src/components/admin/DebitWalletModal.tsx`

**Props:** Same as CreditWalletModal

**Additional Validation:**
- Amount must not exceed current balance
- Show error if insufficient balance

---

### **4. Wallet Audit Log Modal** (New - Priority: MEDIUM)
**Component:** `frontend/src/components/admin/WalletAuditLogModal.tsx`

**Props:**
```typescript
interface WalletAuditLogModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}
```

**Features:**
- Display paginated list of wallet transactions
- Show: Date, Action, Amount, Reason, Admin, Balance Before/After
- Filter by action type (credit/debit/all)
- Export to CSV (future enhancement)

**UI:**
```
┌─────────────────────────────────────────────┐
│  📜 Wallet History - John Doe               │
├─────────────────────────────────────────────┤
│  Filter: [All ▼] [Credit] [Debit]          │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ Feb 24, 2026 10:30 AM                 │ │
│  │ ✅ Credited ₦5,000                     │ │
│  │ Reason: Compensation for late delivery│ │
│  │ By: admin@fulccrum.com                │ │
│  │ Balance: ₦45,000 → ₦50,000            │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ Feb 23, 2026 3:15 PM                  │ │
│  │ ❌ Debited ₦3,000                      │ │
│  │ Reason: Order payment                 │ │
│  │ Balance: ₦48,000 → ₦45,000            │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Page 1 of 5  [< Previous] [Next >]        │
│                                             │
│  [Close]                                    │
└─────────────────────────────────────────────┘
```

---

### **5. Pending Approval Card** (New - Priority: HIGH for Super Admin)
**Component:** `frontend/src/components/admin/PendingApprovalCard.tsx`

**Props:**
```typescript
interface PendingApprovalCardProps {
  action: {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    reason: string;
    user: { name: string; email: string };
    requestedBy: { name: string; email: string };
    createdAt: string;
  };
  onApprove: (actionId: string, notes: string) => void;
  onReject: (actionId: string, reason: string) => void;
}
```

**Features:**
- Display all action details
- Approve button (opens notes modal)
- Reject button (opens reason modal)
- Show requester info
- Show timestamp

---

### **6. API Service Functions** (New - Priority: HIGH)
**File:** `frontend/src/services/api.ts`

**Add these functions:**

```typescript
// Admin Wallet API
export const adminWalletAPI = {
  // Credit user wallet
  creditWallet: (userId: string, amount: number, reason: string, reference?: string) =>
    api.post('/admin/wallets/credit', { userId, amount, reason, reference }),

  // Debit user wallet
  debitWallet: (userId: string, amount: number, reason: string, reference?: string) =>
    api.post('/admin/wallets/debit', { userId, amount, reason, reference }),

  // Get user wallet
  getUserWallet: (userId: string) =>
    api.get(`/admin/wallets/user/${userId}`),

  // Get wallet audit log
  getWalletAuditLog: (userId: string, page = 1, limit = 20) =>
    api.get(`/admin/wallets/user/${userId}/audit-log?page=${page}&limit=${limit}`),

  // Get pending approvals (Super Admin/Finance only)
  getPendingActions: () =>
    api.get('/admin/wallets/pending-actions'),

  // Approve pending action
  approveAction: (actionId: string, notes?: string) =>
    api.post('/admin/wallets/approve', { actionId, notes }),

  // Reject pending action
  rejectAction: (actionId: string, reason: string) =>
    api.post('/admin/wallets/reject', { actionId, reason }),
};
```

---

### **7. Update Existing Screens** (Priority: MEDIUM)

#### **A. UsersScreen.tsx**
Add wallet balance column to user list:
```typescript
// In user card/row, add:
<View style={styles.walletInfo}>
  <Text style={styles.walletLabel}>Wallet:</Text>
  <Text style={styles.walletBalance}>₦{user.walletBalance?.toLocaleString()}</Text>
  <TouchableOpacity onPress={() => openWalletModal(user)}>
    <Ionicons name="wallet-outline" size={20} color={colors.primary} />
  </TouchableOpacity>
</View>
```

#### **B. FinanceScreen.tsx**
Add "Wallet Management" button to navigate to WalletManagementScreen

#### **C. Admin Navigation**
Add WalletManagementScreen to admin navigator:
```typescript
// In AdminNavigator.tsx
import WalletManagementScreen from '../screens/admin/WalletManagementScreen';

// Add to stack:
<Stack.Screen 
  name="WalletManagement" 
  component={WalletManagementScreen}
  options={{ title: 'Wallet Management' }}
/>
```

---

## 🎨 Design Guidelines

### **Colors:**
```typescript
// Use existing theme colors
import { colors } from '../../theme/colors';

// Wallet-specific colors:
const walletColors = {
  credit: colors.success,      // Green for credits
  debit: colors.error,          // Red for debits
  pending: colors.warning,      // Orange for pending
  balance: colors.primary,      // Blue for balance display
};
```

### **Icons:**
```typescript
// Use Ionicons from @expo/vector-icons
import { Ionicons } from '@expo/vector-icons';

// Wallet icons:
wallet-outline          // Main wallet icon
add-circle-outline      // Credit action
remove-circle-outline   // Debit action
time-outline           // Pending approval
checkmark-circle       // Approved
close-circle           // Rejected
document-text-outline  // Audit log
```

### **Typography:**
```typescript
// Amount displays
fontSize: 24,
fontWeight: 'bold',
color: colors.primary,

// Reasons/descriptions
fontSize: 14,
color: colors.textLight,

// Labels
fontSize: 12,
fontWeight: '600',
color: colors.textSecondary,
```

---

## 📡 API Integration Examples

### **Example 1: Credit Wallet**
```typescript
const handleCreditWallet = async () => {
  try {
    setLoading(true);
    const response = await adminWalletAPI.creditWallet(
      userId,
      amount,
      reason,
      reference
    );

    if (response.requiresApproval) {
      Alert.alert(
        'Approval Required',
        response.message,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Success',
        `Wallet credited with ₦${amount.toLocaleString()}`,
        [{ text: 'OK', onPress: onSuccess }]
      );
    }
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Failed to credit wallet');
  } finally {
    setLoading(false);
  }
};
```

### **Example 2: Load Wallet Balance**
```typescript
const loadWalletBalance = async (userId: string) => {
  try {
    const wallet = await adminWalletAPI.getUserWallet(userId);
    setBalance(parseFloat(wallet.balance));
    setPendingBalance(parseFloat(wallet.pendingBalance));
    setFrozenBalance(parseFloat(wallet.frozenBalance));
  } catch (error: any) {
    console.error('Failed to load wallet:', error);
  }
};
```

### **Example 3: Load Pending Approvals**
```typescript
const loadPendingApprovals = async () => {
  try {
    const actions = await adminWalletAPI.getPendingActions();
    setPendingActions(actions);
  } catch (error: any) {
    console.error('Failed to load pending actions:', error);
  }
};
```

### **Example 4: Approve Action**
```typescript
const handleApprove = async (actionId: string) => {
  Alert.prompt(
    'Approval Notes',
    'Add notes for this approval (optional)',
    async (notes) => {
      try {
        await adminWalletAPI.approveAction(actionId, notes);
        Alert.alert('Success', 'Action approved successfully');
        loadPendingApprovals(); // Refresh list
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to approve');
      }
    }
  );
};
```

---

## 🧪 Testing Checklist

### **Test Scenarios:**

#### **1. Credit Wallet (Within Limit)**
- [ ] Login as admin
- [ ] Navigate to Wallet Management
- [ ] Search for customer1@test.com
- [ ] Click "Credit"
- [ ] Enter ₦3,000
- [ ] Enter reason: "Test compensation"
- [ ] Submit
- [ ] Verify success message
- [ ] Verify balance updated

#### **2. Credit Wallet (Requires Approval)**
- [ ] Login as admin
- [ ] Try to credit ₦60,000
- [ ] Verify "requires approval" message
- [ ] Login as super_admin
- [ ] Navigate to Pending Approvals
- [ ] Verify request appears
- [ ] Approve with notes
- [ ] Verify balance updated

#### **3. Debit Wallet**
- [ ] Login as admin
- [ ] Try to debit ₦2,000
- [ ] Verify success or approval required
- [ ] Check balance updated

#### **4. Insufficient Balance**
- [ ] Try to debit more than current balance
- [ ] Verify error message shown

#### **5. View Audit Log**
- [ ] Click "View History" on any user
- [ ] Verify transactions displayed
- [ ] Verify pagination works
- [ ] Verify details are correct

#### **6. Reject Pending Action**
- [ ] Login as super_admin
- [ ] View pending action
- [ ] Click "Reject"
- [ ] Enter reason
- [ ] Verify action removed from pending

---

## 🔒 Security Considerations

### **1. Role-Based UI**
```typescript
// Only show approve/reject for Super Admin/Finance
{user.role === 'super_admin' || user.role === 'finance' ? (
  <View style={styles.pendingActions}>
    {/* Show pending approvals */}
  </View>
) : null}
```

### **2. Input Validation**
```typescript
// Validate amount
if (amount <= 0) {
  Alert.alert('Error', 'Amount must be greater than 0');
  return;
}

if (amount > 1000000) {
  Alert.alert('Error', 'Amount cannot exceed ₦1,000,000');
  return;
}

// Validate reason
if (reason.trim().length < 10) {
  Alert.alert('Error', 'Reason must be at least 10 characters');
  return;
}
```

### **3. Confirmation Dialogs**
```typescript
// Always confirm before crediting/debiting
Alert.alert(
  'Confirm Credit',
  `Credit ₦${amount.toLocaleString()} to ${userName}?\n\nReason: ${reason}`,
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', onPress: handleCredit },
  ]
);
```

---

## 📊 Mock Data for Development

Use this mock data while testing without backend:

```typescript
export const mockWallets = [
  {
    userId: '1',
    userName: 'John Doe',
    email: 'customer1@test.com',
    balance: 50000,
    pendingBalance: 0,
    frozenBalance: 0,
    currency: 'NGN',
  },
  {
    userId: '2',
    userName: 'Jane Smith',
    email: 'customer2@test.com',
    balance: 30000,
    pendingBalance: 2000,
    frozenBalance: 0,
    currency: 'NGN',
  },
];

export const mockAuditLog = [
  {
    id: '1',
    action: 'wallet_credited',
    amount: 5000,
    reason: 'Compensation for late delivery - Order #FUL-2026-123',
    admin: { name: 'Admin User', email: 'admin@fulccrum.com' },
    previousBalance: 45000,
    newBalance: 50000,
    createdAt: '2026-02-24T10:30:00Z',
  },
  {
    id: '2',
    action: 'wallet_debited',
    amount: 3000,
    reason: 'Order payment',
    previousBalance: 48000,
    newBalance: 45000,
    createdAt: '2026-02-23T15:15:00Z',
  },
];

export const mockPendingActions = [
  {
    id: 'pending-1',
    type: 'credit',
    amount: 60000,
    reason: 'Compensation for service issue',
    user: { name: 'John Doe', email: 'customer1@test.com' },
    requestedBy: { name: 'Admin User', email: 'admin@fulccrum.com' },
    createdAt: '2026-02-24T11:00:00Z',
  },
];
```

---

## 🚀 Implementation Priority

### **Phase 1: Core Functionality** (Week 1)
1. ✅ Add API service functions
2. ✅ Create CreditWalletModal
3. ✅ Create WalletManagementScreen (basic)
4. ✅ Test credit wallet flow

### **Phase 2: Approval Workflow** (Week 2)
1. ✅ Create PendingApprovalCard
2. ✅ Add approve/reject functionality
3. ✅ Test approval workflow
4. ✅ Add role-based UI

### **Phase 3: Audit & History** (Week 3)
1. ✅ Create WalletAuditLogModal
2. ✅ Add pagination
3. ✅ Add filters
4. ✅ Test audit log display

### **Phase 4: Polish** (Week 4)
1. ✅ Add DebitWalletModal
2. ✅ Update existing screens
3. ✅ Add wallet info to user cards
4. ✅ Final testing & bug fixes

---

## 📚 Related Documentation

- **Backend API:** `backend/ADMIN_WALLET_SYSTEM.md`
- **Seed Data:** `backend/SEED_DATA_GUIDE.md`
- **Admin System:** `backend/admin/README.md`

---

## 💡 Tips for Implementation

### **1. Reuse Existing Components**
Look at existing admin screens for patterns:
- Modal structure from `PromoManagementScreen.tsx`
- List/card layout from `UsersScreen.tsx`
- Form validation from `AddMerchantScreen.tsx`

### **2. Use Existing Utilities**
```typescript
// Alert utility
import { showAlert } from '../../utils/alert';

// Number formatting
const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

// Date formatting
import { formatDate } from '../../utils/date';
```

### **3. Error Handling**
```typescript
try {
  // API call
} catch (error: any) {
  if (error.statusCode === 403) {
    Alert.alert('Permission Denied', 'You do not have permission for this action');
  } else if (error.statusCode === 404) {
    Alert.alert('Not Found', 'User or wallet not found');
  } else {
    Alert.alert('Error', error.message || 'Something went wrong');
  }
}
```

### **4. Loading States**
```typescript
const [loading, setLoading] = useState(false);

// Show loading indicator
{loading ? (
  <ActivityIndicator size="large" color={colors.primary} />
) : (
  // Content
)}
```

---

## ✅ Definition of Done

A feature is complete when:
- [ ] Code is written and follows existing patterns
- [ ] All validation is implemented
- [ ] Error handling is in place
- [ ] Loading states are shown
- [ ] Success/error messages are displayed
- [ ] Tested with real backend API
- [ ] Tested with mock data (backend down scenario)
- [ ] Works on both iOS and Android
- [ ] UI matches design guidelines
- [ ] Code is reviewed and merged

---

## 🆘 Need Help?

If you encounter issues:
1. Check backend API documentation: `backend/ADMIN_WALLET_SYSTEM.md`
2. Review existing admin screens for patterns
3. Test API endpoints with Postman/Insomnia first
4. Check console logs for error details
5. Verify user has correct admin role

---

**Good luck with the implementation! 🚀**
