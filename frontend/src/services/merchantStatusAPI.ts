import { api } from './api';

export interface StoreStatus {
  status: 'open_active' | 'open_busy' | 'open_unverified' | 'closed';
  reliability: 'high' | 'medium' | 'low';
  message: string;
  showPhone: boolean;
  lastSeenAt?: string;
  manualStatus?: 'auto' | 'force_open' | 'force_closed';
}

export const merchantStatusAPI = {
  // Get merchant store status
  getStatus: async (merchantId: string): Promise<StoreStatus> => {
    const response = await api.get(`/stores/${merchantId}/status`);
    return response.data;
  },

  // Get current user's store status (for merchants)
  getMyStatus: async (): Promise<StoreStatus> => {
    const response = await api.get('/merchant/store/status');
    return response.data;
  },

  // Get all merchant statuses (admin)
  getAllStatuses: async (): Promise<{ merchantId: string; status: StoreStatus }[]> => {
    const response = await api.get('/merchants/status/all');
    return response.data;
  },

  // Manual override store status
  setManualStatus: async (
    merchantId: string,
    manualStatus: 'auto' | 'force_open' | 'force_closed'
  ): Promise<void> => {
    await api.put('/merchant/store/status', {
      status: manualStatus,
    });
  },

  // Update last seen (called when merchant is active)
  updateActivity: async (): Promise<void> => {
    await api.put('/merchant/store/heartbeat');
  },
};
