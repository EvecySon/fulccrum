import { api } from './api';

export interface WalletBalance {
  id: string;
  userId: string;
  balance: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit' | 'order_payment' | 'refund' | 'withdrawal';
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  reference?: string;
  createdAt: string;
  adminId?: string;
  adminName?: string;
}

export interface CreditWalletRequest {
  userId: string;
  amount: number;
  reason: string;
  reference?: string;
}

export interface CreditWalletResponse {
  success: boolean;
  requiresApproval: boolean;
  wallet?: WalletBalance;
  approvalRequest?: {
    id: string;
    amount: number;
    status: 'pending';
  };
  message: string;
}

export interface PendingApproval {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  reason: string;
  requestedBy: string;
  requestedByName: string;
  createdAt: string;
  status: 'pending';
}

export const adminWalletAPI = {
  // Credit user wallet
  creditWallet: async (data: CreditWalletRequest): Promise<CreditWalletResponse> => {
    const response = await api.post('/admin/wallets/credit', data);
    return response.data;
  },

  // Debit user wallet
  debitWallet: async (data: CreditWalletRequest): Promise<CreditWalletResponse> => {
    const response = await api.post('/admin/wallets/debit', data);
    return response.data;
  },

  // Get user wallet
  getUserWallet: async (userId: string): Promise<WalletBalance> => {
    const response = await api.get(`/admin/wallets/${userId}`);
    return response.data;
  },

  // Get user wallet transactions
  getUserTransactions: async (userId: string): Promise<WalletTransaction[]> => {
    const response = await api.get(`/admin/wallets/${userId}/transactions`);
    return response.data;
  },

  // Get pending approvals
  getPendingApprovals: async (): Promise<PendingApproval[]> => {
    const response = await api.get('/admin/wallets/pending-approvals');
    return response.data;
  },

  // Approve pending credit
  approveCredit: async (requestId: string): Promise<void> => {
    await api.post(`/admin/wallets/approve/${requestId}`);
  },

  // Reject pending credit
  rejectCredit: async (requestId: string, reason: string): Promise<void> => {
    await api.post(`/admin/wallets/reject/${requestId}`, { reason });
  },

  // Get all wallet audit logs
  getAuditLogs: async (filters?: {
    userId?: string;
    adminId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<WalletTransaction[]> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.adminId) params.append('adminId', filters.adminId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const response = await api.get(`/admin/wallets/audit-logs?${params.toString()}`);
    return response.data;
  },
};
