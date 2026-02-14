import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Automatically detect the correct base URL based on platform
const DEV_IP = '192.168.0.101';

const getBaseUrl = () => {
  // In production, use your production API URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.fulccrum.com';
  }
  
  // For development:
  if (Platform.OS === 'web') {
    // If opened on the same machine use localhost, otherwise use LAN IP
    const host = typeof window !== 'undefined' && window.location?.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    return `http://${DEV_IP}:3001`;
  }
  // Mobile (iOS/Android): always use LAN IP
  return `http://${DEV_IP}:3001`;
};

const BASE_URL = getBaseUrl();

export const getApiBaseUrl = () => BASE_URL;

// Token management
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Persistent token storage
export const saveTokens = async (access: string, refresh?: string) => {
  accessToken = access;
  await AsyncStorage.setItem('accessToken', access);
  if (refresh) {
    await AsyncStorage.setItem('refreshToken', refresh);
  }
};

export const loadTokens = async () => {
  const access = await AsyncStorage.getItem('accessToken');
  const refresh = await AsyncStorage.getItem('refreshToken');
  if (access) accessToken = access;
  return { access, refresh };
};

export const clearTokens = async () => {
  accessToken = null;
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
};

// Generic fetch wrapper
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && accessToken) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      const retryResponse = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        const error: any = new Error(errorData.message || `Request failed (${retryResponse.status})`);
        error.status = retryResponse.status;
        error.data = errorData;
        throw error;
      }
      if (retryResponse.status === 204) return {} as T;
      return retryResponse.json();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: any = new Error(errorData.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) return {} as T;

  return response.json();
}

// Refresh token logic
let isRefreshing = false;
async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing) return false;
  isRefreshing = true;
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    await saveTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  } finally {
    isRefreshing = false;
  }
}

// HTTP methods
export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  patch: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  delete: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),

  // File upload (multipart)
  upload: async <T = any>(endpoint: string, formData: FormData) => {
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(errorData.message || 'Upload failed');
      error.status = response.status;
      throw error;
    }
    return response.json() as Promise<T>;
  },
};

// ─── Auth API ───
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) => api.post('/auth/register', data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  verifyOTP: (otp: string, email: string) =>
    api.post('/auth/verify-otp', { otp, email }),

  resetPassword: (email: string, resetToken: string, newPassword: string) =>
    api.post('/auth/reset-password', { email, resetToken, newPassword }),

  resendOTP: (email: string) =>
    api.post('/auth/resend-otp', { email }),

  verifyRegistration: (email: string, otp: string) =>
    api.post('/auth/verify-registration', { email, otp }),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),

  googleLogin: (idToken: string) =>
    api.post('/auth/google', { idToken }),

  appleLogin: (identityToken: string, fullName?: { firstName?: string; lastName?: string }) =>
    api.post('/auth/apple', { identityToken, fullName }),

  initiateRegistrationPayment: (data: { email: string; role: string; amount: number }) =>
    api.post('/auth/register/payment', data),
  verifyRegistrationPayment: (reference: string) =>
    api.post(`/auth/register/payment/verify?reference=${reference}`),
};

// ─── Users API ───
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: {
    firstName?: string; lastName?: string; email?: string; phone?: string; avatar?: string;
    dietaryPreferences?: string[]; allergies?: string[]; customAllergies?: string;
  }) => api.patch('/users/profile', data),
  updateBusinessProfile: (data: any) => api.patch('/users/business/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/users/change-password', { currentPassword, newPassword }),
  deleteAccount: (password: string) => api.delete('/users/account', { password }),
  exportData: () => api.get('/users/data-export'),
};

// ─── Search API ───
export const searchAPI = {
  searchAll: (query: string) => api.get(`/search?q=${encodeURIComponent(query)}`),
  searchBusinesses: (query: string) => api.get(`/search/businesses?q=${encodeURIComponent(query)}`),
  searchMenuItems: (query: string, businessId?: string) =>
    api.get(`/search/menu-items?q=${encodeURIComponent(query)}${businessId ? `&businessId=${businessId}` : ''}`),
};

// ─── Favorites API ───
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (businessId: string) => api.post(`/favorites/${businessId}`),
  remove: (businessId: string) => api.delete(`/favorites/${businessId}`),
  check: (businessId: string) => api.get(`/favorites/check/${businessId}`),
};

// ─── Addresses API ───
export const addressesAPI = {
  getAll: () => api.get('/addresses'),
  get: (id: string) => api.get(`/addresses/${id}`),
  create: (data: any) => api.post('/addresses', data),
  update: (id: string, data: any) => api.patch(`/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/addresses/${id}`),
  setDefault: (id: string) => api.patch(`/addresses/${id}/set-default`),
};

// ─── Orders API ───
export const ordersAPI = {
  create: (data: any) => api.post('/orders', data),
  get: (id: string) => api.get(`/orders/${id}`),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  getMyOrders: (page = 1, limit = 20) => api.get(`/orders/customer/my-orders?page=${page}&limit=${limit}`),
  getDriverOrders: (status?: string) => api.get(`/orders/driver/assigned${status ? `?status=${status}` : ''}`),
  getBusinessOrders: (businessId: string, page = 1, limit = 20) =>
    api.get(`/orders/business/${businessId}?page=${page}&limit=${limit}`),
  assignDriver: (orderId: string, driverId: string) =>
    api.patch(`/orders/${orderId}/assign-driver`, { driverId }),
  getAvailableDeliveries: (page = 1, limit = 20) =>
    api.get(`/orders/available/deliveries?page=${page}&limit=${limit}`),
  reorder: (orderId: string) => api.post(`/orders/${orderId}/reorder`),
  cancel: (orderId: string, reason?: string) => api.post(`/orders/${orderId}/cancel`, { reason }),
};

// ─── Menu API ───
export const menuAPI = {
  getCategories: (businessId: string, includeInactive = false) =>
    api.get(`/menu/categories?businessId=${businessId}${includeInactive ? '&includeInactive=true' : ''}`),
  createCategory: (data: any) => api.post('/menu/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/menu/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/menu/categories/${id}`),
  getItems: (businessId: string, categoryId?: string) =>
    api.get(`/menu/items?businessId=${businessId}${categoryId ? `&categoryId=${categoryId}` : ''}`),
  getItem: (id: string) => api.get(`/menu/items/${id}`),
  createItem: (data: any) => api.post('/menu/items', data),
  updateItem: (id: string, data: any) => api.put(`/menu/items/${id}`, data),
  toggleAvailability: (id: string) => api.patch(`/menu/items/${id}/toggle-availability`),
  deleteItem: (id: string) => api.delete(`/menu/items/${id}`),
  getModifiers: (businessId: string) => api.get(`/menu/modifiers?businessId=${businessId}`),
  createModifier: (data: any) => api.post('/menu/modifiers', data),
  addModifierOption: (modifierId: string, data: any) => api.post(`/menu/modifiers/${modifierId}/options`, data),
  linkModifier: (itemId: string, modifierId: string) => api.post(`/menu/items/${itemId}/modifiers/${modifierId}`),
  getBusinessHours: (businessId: string) => api.get(`/menu/business-hours?businessId=${businessId}`),
  setBusinessHours: (hours: any[]) => api.post('/menu/business-hours', hours),
  isOpen: (businessId: string) => api.get(`/menu/business-hours/is-open?businessId=${businessId}`),
  getInventory: () => api.get('/menu/inventory'),
  updateInventory: (itemId: string, data: any) => api.put(`/menu/inventory/${itemId}`, data),
  getLowStock: () => api.get('/menu/inventory/low-stock'),
};

// ─── Payment API ───
export const paymentAPI = {
  initialize: (orderId: string, amount: number) => api.post('/payment/initialize', { orderId, amount }),
  verify: (reference: string) => api.get(`/payment/verify/${reference}`),
  refund: (orderId: string, amount?: number) => api.post(`/payment/refund/${orderId}`, { amount }),
  history: (page = 1, limit = 20) => api.get(`/payment/history?page=${page}&limit=${limit}`),
  // Saved cards
  getSavedCards: () => api.get('/payment/cards'),
  saveCard: (data: { authorizationCode: string; cardType: string; last4: string; expMonth: string; expYear: string; bank: string }) =>
    api.post('/payment/cards', data),
  setDefaultCard: (id: string) => api.patch(`/payment/cards/${id}/set-default`),
  deleteCard: (id: string) => api.delete(`/payment/cards/${id}`),
  // Top-up & card add
  topUp: (amount: number) => api.post('/payment/topup', { amount }),
  verifyTopUp: (reference: string) => api.get(`/payment/topup/verify/${reference}`),
  addCard: () => api.post('/payment/cards/add'),
};

// ─── Wallet API ───
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  requestWithdrawal: (amount: number) => api.post('/wallet/withdraw/request', { amount }),
  confirmWithdrawal: (requestId: string, confirmationCode: string) =>
    api.post('/wallet/withdraw/confirm', { requestId, confirmationCode }),
  withdrawalHistory: (page = 1, limit = 20) => api.get(`/wallet/withdraw/history?page=${page}&limit=${limit}`),
  cancelWithdrawal: (requestId: string) => api.post('/wallet/withdraw/cancel', { requestId }),
  // Bank accounts
  getBankAccounts: () => api.get('/wallet/bank-accounts'),
  addBankAccount: (data: { accountName: string; accountNumber: string; bankCode: string; bankName: string }) =>
    api.post('/wallet/bank-accounts', data),
  setDefaultBankAccount: (id: string) => api.patch(`/wallet/bank-accounts/${id}/set-default`),
  deleteBankAccount: (id: string) => api.delete(`/wallet/bank-accounts/${id}`),
};

// ─── Reviews API ───
export const reviewsAPI = {
  create: (data: any) => api.post('/reviews', data),
  get: (id: string) => api.get(`/reviews/${id}`),
  getBusinessReviews: (businessId: string, page = 1) => api.get(`/reviews/business/${businessId}?page=${page}`),
  getDriverReviews: (driverId: string, page = 1) => api.get(`/reviews/driver/${driverId}?page=${page}`),
  getMyReviews: (page = 1) => api.get(`/reviews/customer/my-reviews?page=${page}`),
  respond: (id: string, response: string) => api.post(`/reviews/${id}/respond`, { businessResponse: response }),
  markHelpful: (id: string) => api.patch(`/reviews/${id}/helpful`),
  getBusinessStats: (businessId: string) => api.get(`/reviews/business/${businessId}/stats`),
  hide: (id: string, notes: string) => api.patch(`/reviews/${id}/hide`, { moderationNotes: notes }),
  unhide: (id: string) => api.patch(`/reviews/${id}/unhide`),
};

// ─── Promos API ───
export const promosAPI = {
  validate: (code: string, orderAmount: number) => api.post('/promos/validate', { code, orderAmount }),
  getAll: (page = 1, activeOnly = true) => api.get(`/promos?page=${page}&activeOnly=${activeOnly}`),
  get: (id: string) => api.get(`/promos/${id}`),
  getStats: (id: string) => api.get(`/promos/${id}/stats`),
  create: (data: any) => api.post('/promos', data),
  update: (id: string, data: any) => api.put(`/promos/${id}`, data),
  toggle: (id: string) => api.patch(`/promos/${id}/toggle`),
  delete: (id: string) => api.delete(`/promos/${id}`),
  myUsage: (page = 1) => api.get(`/promos/my-usage?page=${page}`),
};

// ─── Loyalty API ───
export const loyaltyAPI = {
  getProfile: () => api.get('/loyalty/profile'),
  getHistory: (page = 1) => api.get(`/loyalty/history?page=${page}`),
  getRewards: () => api.get('/loyalty/rewards'),
  redeem: (rewardId: string) => api.post(`/loyalty/redeem/${rewardId}`),
};

// ─── Flash Sales API ───
export const flashSalesAPI = {
  getAll: () => api.get('/merchant/flash-sales'),
  create: (data: any) => api.post('/merchant/flash-sales', data),
  update: (id: string, data: any) => api.patch(`/merchant/flash-sales/${id}`, data),
  toggle: (id: string) => api.patch(`/merchant/flash-sales/${id}/toggle`),
  delete: (id: string) => api.delete(`/merchant/flash-sales/${id}`),
};

// ─── Notifications API ───
export const notificationsAPI = {
  getAll: (unreadOnly = false, page = 1) =>
    api.get(`/notifications?unreadOnly=${unreadOnly}&page=${page}`),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  registerDevice: (token: string, platform: string, deviceId?: string) =>
    api.post('/notifications/devices/register', { token, platform, deviceId }),
  create: (data: { title: string; body: string; audience?: string; userId?: string }) =>
    api.post('/notifications', data),
  sendTest: (userId: string) => api.post(`/notifications/test/${userId}`),
};

// ─── Location API ───
export const locationAPI = {
  updateDriverLocation: (data: { latitude: number; longitude: number; accuracy?: number; heading?: number; speed?: number }) =>
    api.post('/location/driver/update', data),
  getDriverLocation: (driverId: string) => api.get(`/location/driver/${driverId}`),
  setOnlineStatus: (isOnline: boolean) => api.post('/location/driver/online', { isOnline }),
  getNearbyDrivers: (lat: number, lng: number, radius = 5) =>
    api.get(`/location/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`),
  trackOrder: (orderId: string) => api.get(`/location/track/order/${orderId}`),
};

// ─── Analytics API ───
export const analyticsAPI = {
  merchantAnalytics: (period = 'today') => api.get(`/analytics/merchant?period=${period}`),
  dashboard: () => api.get('/analytics/dashboard'),
  revenue: (days = 30) => api.get(`/analytics/revenue?days=${days}`),
  topPerformers: (type: string, limit = 10) =>
    api.get(`/analytics/top-performers?type=${type}&limit=${limit}`),
  revenueForecast: (days = 30) => api.get(`/analytics/forecast/revenue?days=${days}`),
  orderTrends: (days = 30) => api.get(`/analytics/forecast/orders?days=${days}`),
  customerInsights: () => api.get('/analytics/insights/customers'),
  predictive: () => api.get('/analytics/predictive'),
};

// ─── Admin API ───
export const adminAPI = {
  getUsers: (page = 1, limit = 50) => api.get(`/admin/users?page=${page}&limit=${limit}`),
  suspendUser: (userId: string) => api.patch(`/admin/users/${userId}/suspend`),
  activateUser: (userId: string) => api.patch(`/admin/users/${userId}/activate`),
  getOrders: (page = 1, limit = 50) => api.get(`/admin/orders?page=${page}&limit=${limit}`),
  getMetrics: () => api.get('/admin/metrics'),
  getPendingWithdrawals: (page = 1) => api.get(`/admin/withdrawals/pending?page=${page}`),
  approveWithdrawal: (id: string) => api.post(`/admin/withdrawals/${id}/approve`),
  rejectWithdrawal: (id: string, reason: string) => api.post(`/admin/withdrawals/${id}/reject`, { reason }),
  getActivity: (limit = 20) => api.get(`/admin/activity?limit=${limit}`),
  // Merchant management
  getPendingMerchants: (page = 1) => api.get(`/admin/merchants/pending?page=${page}`),
  approveMerchant: (merchantId: string) => api.patch(`/admin/merchants/${merchantId}/approve`),
  rejectMerchant: (merchantId: string, reason?: string) => api.patch(`/admin/merchants/${merchantId}/reject`, { reason }),
  // Courier management
  getPendingCouriers: (page = 1) => api.get(`/admin/couriers/pending?page=${page}`),
  approveCourier: (courierId: string) => api.patch(`/admin/couriers/${courierId}/approve`),
  rejectCourier: (courierId: string, reason?: string) => api.patch(`/admin/couriers/${courierId}/reject`, { reason }),
  getCouriers: (page = 1, limit = 50) => api.get(`/admin/couriers?page=${page}&limit=${limit}`),
  // Admin-initiated registration (invite)
  inviteMerchant: (data: { email: string; businessName: string; ownerName: string; phone?: string; commission?: number }) =>
    api.post('/admin/invite/merchant', data),
  inviteCourier: (data: { email: string; fullName: string; phone?: string; vehicleType?: string }) =>
    api.post('/admin/invite/courier', data),
  resendInvite: (userId: string) => api.post(`/admin/users/${userId}/resend-invite`),
  // Registration fee management
  getRegistrationFees: () => api.get('/admin/registration-fees'),
  updateRegistrationFee: (role: string, data: { amount: number; currency?: string; description?: string }) =>
    api.put(`/admin/registration-fees/${role}`, data),
  getRegistrationPayments: (page = 1) => api.get(`/admin/registration-payments?page=${page}`),
  waiveRegistrationFee: (userId: string) => api.post(`/admin/users/${userId}/waive-fee`),
  // Admin user management
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    api.post('/admin/admins', data),
  removeAdmin: (userId: string) => api.delete(`/admin/admins/${userId}`),
};

// ─── Finance API ───
export const financeAPI = {
  // Commission endpoints
  createCommissionTier: (data: any) => api.post('/admin/finance/commissions/tiers', data),
  getCommissionTiers: (businessType?: string, isActive?: boolean) => 
    api.get(`/admin/finance/commissions/tiers${businessType ? `?businessType=${businessType}` : ''}${isActive !== undefined ? `${businessType ? '&' : '?'}isActive=${isActive}` : ''}`),
  updateCommissionTier: (id: string, data: any) => api.patch(`/admin/finance/commissions/tiers/${id}`, data),
  assignCommission: (data: any) => api.post('/admin/finance/commissions/assign', data),
  getMerchantCommissions: (businessId: string) => api.get(`/admin/finance/commissions/merchant/${businessId}`),
  
  // Revenue endpoints
  getRevenueAnalytics: (startDate: string, endDate: string, groupBy?: string) => 
    api.get(`/admin/finance/revenue/analytics?startDate=${startDate}&endDate=${endDate}${groupBy ? `&groupBy=${groupBy}` : ''}`),
  getRevenueForecast: (days?: number) => api.get(`/admin/finance/revenue/forecast${days ? `?days=${days}` : ''}`),
  getMerchantSettlements: (businessId?: string, status?: string) =>
    api.get(`/admin/finance/revenue/settlements${businessId ? `?businessId=${businessId}` : ''}${status ? `${businessId ? '&' : '?'}status=${status}` : ''}`),
  reconcileOrder: (orderId: string) => api.post(`/admin/finance/revenue/reconcile/${orderId}`),
  
  // Refund endpoints
  createRefund: (data: any) => api.post('/admin/finance/refunds', data),
  getRefunds: (status?: string, page = 1, limit = 50) => 
    api.get(`/admin/finance/refunds?${status ? `status=${status}&` : ''}page=${page}&limit=${limit}`),
  approveRefund: (id: string) => api.patch(`/admin/finance/refunds/${id}/approve`),
  rejectRefund: (id: string, reason: string) => api.patch(`/admin/finance/refunds/${id}/reject`, { reason }),
  getRefundStats: (startDate: string, endDate: string) => 
    api.get(`/admin/finance/refunds/stats?startDate=${startDate}&endDate=${endDate}`),
  
  // Reports
  exportFinancialReport: (startDate: string, endDate: string, format: 'csv' | 'json' = 'json') =>
    api.get(`/admin/finance/reports/export?startDate=${startDate}&endDate=${endDate}&format=${format}`),
};

// ─── Operations API ───
export const operationsAPI = {
  getLiveMap: () => api.get('/admin/operations/live-map'),
  
  // Incidents
  getIncidents: (filters?: any) => {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    return api.get(`/admin/operations/incidents${query}`);
  },
  createIncident: (data: any) => api.post('/admin/operations/incidents', data),
  resolveIncident: (id: string, resolution: string) => 
    api.patch(`/admin/operations/incidents/${id}/resolve`, { resolution }),
  assignIncident: (id: string, assignedTo: string) => 
    api.patch(`/admin/operations/incidents/${id}/assign`, { assignedTo }),
  
  // SLA
  getSLAConfigs: () => api.get('/admin/operations/sla/configs'),
  createSLAConfig: (data: any) => api.post('/admin/operations/sla/configs', data),
  getSLABreaches: (startDate: string, endDate: string) => 
    api.get(`/admin/operations/sla/breaches?startDate=${startDate}&endDate=${endDate}`),
  checkSLABreach: (orderId: string) => api.post(`/admin/operations/sla/check/${orderId}`),
  
  // Delivery Zones
  getDeliveryZones: (city?: string) => api.get(`/admin/operations/delivery-zones${city ? `?city=${city}` : ''}`),
  createDeliveryZone: (data: any) => api.post('/admin/operations/delivery-zones', data),
  updateDeliveryZone: (id: string, data: any) => api.patch(`/admin/operations/delivery-zones/${id}`, data),
};

// ─── RBAC API ───
export const rbacAPI = {
  // Roles
  createRole: (data: any) => api.post('/admin/rbac/roles', data),
  getRoles: () => api.get('/admin/rbac/roles'),
  updateRole: (id: string, data: any) => api.patch(`/admin/rbac/roles/${id}`, data),
  assignRole: (data: { userId: string; roleId: string; department?: string }) => 
    api.post('/admin/rbac/assign', data),
  getUserPermissions: (userId: string) => api.get(`/admin/rbac/permissions/${userId}`),
  
  // Audit Logs
  getAuditLogs: (filters?: any) => {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    return api.get(`/admin/rbac/audit-logs${query}`);
  },
  getResourceHistory: (resource: string, resourceId: string) => 
    api.get(`/admin/rbac/audit-logs/resource/${resource}/${resourceId}`),
  exportAuditLogs: (filters?: any) => {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    return api.get(`/admin/rbac/audit-logs/export${query}`);
  },
};

// ─── Moderation API ───
export const moderationAPI = {
  // Content Moderation
  getQueue: (filters?: any) => {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    return api.get(`/admin/moderation/queue${query}`);
  },
  approveContent: (id: string) => api.patch(`/admin/moderation/${id}/approve`),
  rejectContent: (id: string, reason: string) => api.patch(`/admin/moderation/${id}/reject`, { reason }),
  getModerationStats: (startDate: string, endDate: string) => 
    api.get(`/admin/moderation/stats?startDate=${startDate}&endDate=${endDate}`),
  
  // Compliance
  getAllCompliance: (filters?: any) => {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    return api.get(`/admin/moderation/compliance${query}`);
  },
  getCompliance: (businessId: string) => api.get(`/admin/moderation/compliance/${businessId}`),
  updateCompliance: (businessId: string, data: any) => 
    api.patch(`/admin/moderation/compliance/${businessId}`, data),
  getComplianceStats: () => api.get('/admin/moderation/compliance/stats'),

  // Customer-facing content reporting (feeds into moderation queue)
  reportContent: (data: { type: 'menu_item' | 'review' | 'business_profile'; resourceId: string; reason: string; details?: string }) =>
    api.post('/report/content', data),
};

// ─── Report API (Customer-facing) ───
export const reportAPI = {
  reportContent: (data: { type: 'menu_item' | 'review' | 'business_profile'; resourceId: string; reason: string; details?: string }) =>
    api.post('/report/content', data),
  getMyReports: () => api.get('/report/my-reports'),
};

// ─── Marketing API ───
export const marketingAPI = {
  // Campaigns
  createCampaign: (data: any) => api.post('/admin/marketing/campaigns', data),
  getCampaigns: (filters?: any) => {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    return api.get(`/admin/marketing/campaigns${query}`);
  },
  updateCampaign: (id: string, data: any) => api.patch(`/admin/marketing/campaigns/${id}`, data),
  launchCampaign: (id: string) => api.post(`/admin/marketing/campaigns/${id}/launch`),
  pauseCampaign: (id: string) => api.post(`/admin/marketing/campaigns/${id}/pause`),
  getCampaignAnalytics: (id: string) => api.get(`/admin/marketing/campaigns/${id}/analytics`),
  
  // Promo Codes
  createPromoCode: (data: any) => api.post('/admin/marketing/promo-codes', data),
  getPromoCodes: (isActive?: boolean, page = 1, limit = 50) => 
    api.get(`/admin/marketing/promo-codes?${isActive !== undefined ? `isActive=${isActive}&` : ''}page=${page}&limit=${limit}`),
  updatePromoCode: (id: string, data: any) => api.patch(`/admin/marketing/promo-codes/${id}`, data),
  validatePromoCode: (data: { code: string; userId: string; orderAmount: number }) => 
    api.post('/admin/marketing/promo-codes/validate', data),
};

// ─── Analytics API (Admin) ───
export const adminAnalyticsAPI = {
  // Custom Reports
  createCustomReport: (data: any) => api.post('/admin/analytics/custom-reports', data),
  getCustomReports: () => api.get('/admin/analytics/custom-reports'),
  runReport: (id: string) => api.post(`/admin/analytics/custom-reports/${id}/run`),
  
  // Cohort Analysis
  getCohorts: (cohortType: string, startDate?: string, endDate?: string) => 
    api.get(`/admin/analytics/cohorts?cohortType=${cohortType}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`),
  generateCohortAnalysis: (data: { cohortType: 'customer' | 'merchant' | 'courier'; startDate: string; endDate: string }) =>
    api.post('/admin/analytics/cohorts/generate', data),
  
  // Funnel Analysis
  getFunnels: (startDate: string, endDate: string) => 
    api.get(`/admin/analytics/funnels?startDate=${startDate}&endDate=${endDate}`),
};

// ─── Support API ───
export const supportAPI = {
  createTicket: (data: any) => api.post('/support/tickets', data),
  getTickets: (filters?: any) => api.get(`/support/tickets${filters ? `?${new URLSearchParams(filters)}` : ''}`),
  getTicket: (id: string) => api.get(`/support/tickets/${id}`),
  addMessage: (ticketId: string, data: any) => api.post(`/support/tickets/${ticketId}/messages`, data),
  updateStatus: (ticketId: string, status: string, data?: any) =>
    api.patch(`/support/tickets/${ticketId}/status`, { status, ...data }),
  assignTicket: (ticketId: string, assignedToId: string) =>
    api.patch(`/support/tickets/${ticketId}/assign`, { assignedToId }),
  rateTicket: (ticketId: string, rating: number) =>
    api.post(`/support/tickets/${ticketId}/rate`, { rating }),
  getStats: (filters?: any) => api.get(`/support/stats${filters ? `?${new URLSearchParams(filters)}` : ''}`),
};

// ─── Fees API ───
export const feesAPI = {
  calculate: (data: any) => api.post('/fees/calculate', data),
};

// ─── Zones API ───
export const zonesAPI = {
  create: (data: any) => api.post('/zones', data),
  getBusinessZones: (businessId: string) => api.get(`/zones/business/${businessId}`),
  get: (id: string) => api.get(`/zones/${id}`),
  update: (id: string, data: any) => api.put(`/zones/${id}`, data),
  delete: (id: string) => api.delete(`/zones/${id}`),
  checkAvailability: (businessId: string, lat: number, lng: number) =>
    api.post('/zones/check-availability', { businessId, latitude: lat, longitude: lng }),
};

// ─── Upload API ───
export const uploadAPI = {
  uploadImage: (formData: FormData) => api.upload('/upload/image', formData),
  uploadDocument: (formData: FormData) => api.upload('/upload/document', formData),
  uploadAvatar: (formData: FormData) => api.upload('/upload/avatar', formData),
  uploadBusinessLogo: (formData: FormData) => api.upload('/upload/business/logo', formData),
  uploadBusinessCover: (formData: FormData) => api.upload('/upload/business/cover', formData),
  getFiles: (page = 1) => api.get(`/upload/files?page=${page}`),
  deleteFile: (id: string) => api.delete(`/upload/files/${id}`),
};

// ─── Messaging / Chat API ───
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getConversation: (orderId: string) => api.get(`/chat/conversations/${orderId}`),
  getMessages: (conversationId: string, page = 1) => api.get(`/chat/conversations/${conversationId}/messages?page=${page}`),
  sendMessage: (conversationId: string, data: { text?: string; image?: string; type?: string }) => api.post(`/chat/conversations/${conversationId}/messages`, data),
  markRead: (conversationId: string) => api.put(`/chat/conversations/${conversationId}/read`, {}),
  startCall: (conversationId: string, type: 'voice' | 'video') => api.post(`/chat/conversations/${conversationId}/call`, { type }),
  endCall: (callId: string) => api.put(`/chat/calls/${callId}/end`, {}),
};

// ─── AI / Personalization API ───
export const aiAPI = {
  getRecommendations: (limit = 10) => api.get(`/ai/recommendations?limit=${limit}`),
  getPredictiveOrders: () => api.get('/ai/predictive-orders'),
  getVoiceProfile: () => api.get('/ai/voice-profile'),
  processVoiceCommand: (audioUri: string) => api.post('/ai/voice-command', { audioUri }),
  getBehaviorAnalysis: () => api.get('/ai/behavior-analysis'),
  dismissRecommendation: (id: string) => api.post(`/ai/recommendations/${id}/dismiss`),
  acceptRecommendation: (id: string) => api.post(`/ai/recommendations/${id}/accept`),
};

// ─── AR / VR API ───
export const arAPI = {
  getAvailableModels: () => api.get('/ar/models'),
  getVRTours: () => api.get('/ar/tours'),
  getFoodPreview: (itemId: string) => api.get(`/ar/food-preview/${itemId}`),
  getRestaurantTour: (businessId: string) => api.get(`/ar/restaurant-tour/${businessId}`),
  getARNavigation: (orderId: string) => api.get(`/ar/navigation/${orderId}`),
};

// ─── Social API ───
export const socialAPI = {
  getConnections: () => api.get('/social/connections'),
  addConnection: (userId: string, type: string) => api.post('/social/connections', { userId, type }),
  removeConnection: (connectionId: string) => api.delete(`/social/connections/${connectionId}`),
  getFeed: (page = 1) => api.get(`/social/posts?page=${page}`),
  createPost: (data: any) => api.post('/social/posts', data),
  likePost: (postId: string) => api.post(`/social/posts/${postId}/like`),
  commentPost: (postId: string, text: string) => api.post(`/social/posts/${postId}/comment`, { text }),
  getChallenges: () => api.get('/social/challenges'),
  joinChallenge: (challengeId: string) => api.post(`/social/challenges/${challengeId}/join`),
  getGroupOrders: () => api.get('/social/group-orders'),
  createGroupOrder: (data: any) => api.post('/social/group-orders', data),
  getGroupOrder: (id: string) => api.get(`/social/group-orders/${id}`),
  getGroupOrderByCode: (code: string) => api.get(`/social/group-orders/join/${code}`),
  joinGroupOrder: (inviteCode: string) => api.post(`/social/group-orders/join/${inviteCode}`),
  updateMemberItems: (id: string, items: any[], subtotal: number) => api.post(`/social/group-orders/${id}/items`, { items, subtotal }),
  updateMemberStatus: (id: string, status: string) => api.post(`/social/group-orders/${id}/status`, { status }),
  leaveGroupOrder: (id: string) => api.delete(`/social/group-orders/${id}/leave`),
};

// ─── Blockchain API ───
export const blockchainAPI = {
  getSupplyChain: (itemId: string) => api.get(`/blockchain/supply-chain/${itemId}`),
  initCryptoPayment: (orderId: string, cryptoType: string) =>
    api.post('/blockchain/crypto-payment', { orderId, cryptoType }),
  getNFTRewards: () => api.get('/blockchain/nft-rewards'),
  claimNFT: (rewardId: string) => api.post(`/blockchain/nft-rewards/${rewardId}/claim`),
};

// ─── Sustainability API ───
export const sustainabilityAPI = {
  getCarbonFootprint: () => api.get('/sustainability/carbon-footprint'),
  getOrderFootprint: (orderId: string) => api.get(`/sustainability/carbon-footprint/${orderId}`),
  getEcoOptions: () => api.get('/sustainability/eco-options'),
  updateEcoOptions: (data: any) => api.patch('/sustainability/eco-options', data),
  getWasteReduction: () => api.get('/sustainability/waste-reduction'),
  purchaseOffset: (amount: number) => api.post('/sustainability/carbon-offset', { amount }),
};

// ─── Smart Kitchen API (Merchant) ───
export const kitchenAPI = {
  getOperations: () => api.get('/merchant/kitchen/operations'),
  updateOperation: (id: string, data: any) => api.patch(`/merchant/kitchen/operations/${id}`, data),
  getInventory: () => api.get('/merchant/kitchen/inventory'),
  updateInventory: (id: string, data: any) => api.patch(`/merchant/kitchen/inventory/${id}`, data),
  getPrepPredictions: () => api.get('/merchant/kitchen/prep-predictions'),
  startPrep: (orderId: string, itemId: string) =>
    api.post('/merchant/kitchen/operations', { orderId, itemId, operationType: 'prep_start' }),
  completePrep: (operationId: string) =>
    api.patch(`/merchant/kitchen/operations/${operationId}`, { operationType: 'prep_complete' }),
};

// ─── Merchant AI Insights API ───
export const merchantInsightsAPI = {
  getDemandForecast: () => api.get('/merchant/insights/demand-forecast'),
  getPricingOptimization: () => api.get('/merchant/insights/pricing'),
  getMenuOptimization: () => api.get('/merchant/insights/menu'),
  getAllInsights: () => api.get('/merchant/insights'),
  implementInsight: (id: string) => api.post(`/merchant/insights/${id}/implement`),
  dismissInsight: (id: string) => api.post(`/merchant/insights/${id}/dismiss`),
};

// ─── Merchant CRM API ───
export const merchantCrmAPI = {
  getCustomerProfiles: (page = 1) => api.get(`/merchant/crm/customers?page=${page}`),
  getCustomerProfile: (customerId: string) => api.get(`/merchant/crm/customers/${customerId}`),
  createCustomerProfile: (data: any) => api.post('/merchant/crm/customers', data),
  getCampaigns: () => api.get('/merchant/crm/campaigns'),
  createCampaign: (data: any) => api.post('/merchant/crm/campaigns', data),
  updateCampaign: (id: string, data: any) => api.patch(`/merchant/crm/campaigns/${id}`, data),
  deleteCampaign: (id: string) => api.delete(`/merchant/crm/campaigns/${id}`),
  getLoyaltyProgram: () => api.get('/merchant/crm/loyalty'),
  updateLoyaltyProgram: (data: any) => api.patch('/merchant/crm/loyalty', data),
};

// ─── Multi-Channel / Subscriptions API (Merchant) ───
export const channelsAPI = {
  getChannels: () => api.get('/merchant/channels'),
  updateChannel: (id: string, data: any) => api.patch(`/merchant/channels/${id}`, data),
  getSubscriptions: () => api.get('/merchant/subscriptions'),
  createSubscription: (data: any) => api.post('/merchant/subscriptions', data),
  updateSubscription: (id: string, data: any) => api.patch(`/merchant/subscriptions/${id}`, data),
  deleteSubscription: (id: string) => api.delete(`/merchant/subscriptions/${id}`),
  getCatering: () => api.get('/merchant/catering'),
  createCateringOrder: (data: any) => api.post('/merchant/catering', data),
};

// ─── Dynamic Pricing API (Merchant) ───
export const dynamicPricingAPI = {
  getRules: () => api.get('/merchant/pricing/rules'),
  createRule: (data: any) => api.post('/merchant/pricing/rules', data),
  updateRule: (id: string, data: any) => api.patch(`/merchant/pricing/rules/${id}`, data),
  deleteRule: (id: string) => api.delete(`/merchant/pricing/rules/${id}`),
  toggleRule: (id: string) => api.patch(`/merchant/pricing/rules/${id}/toggle`),
  getPreview: (ruleId: string) => api.get(`/merchant/pricing/rules/${ruleId}/preview`),
};

// ─── Community Marketplace API (Merchant) ───
export const marketplaceAPI = {
  getMyListings: () => api.get('/merchant/marketplace'),
  browseAll: (page = 1) => api.get(`/merchant/marketplace/browse?page=${page}`),
  createListing: (data: any) => api.post('/merchant/marketplace', data),
  updateListing: (id: string, data: any) => api.patch(`/merchant/marketplace/${id}`, data),
  toggleListing: (id: string) => api.patch(`/merchant/marketplace/${id}/toggle`),
  deleteListing: (id: string) => api.delete(`/merchant/marketplace/${id}`),
};

// ─── Courier Performance / Fleet API ───
export const courierFleetAPI = {
  getPerformance: () => api.get('/courier/performance'),
  getPredictions: () => api.get('/courier/predictions'),
  getDispatch: () => api.get('/courier/dispatch'),
  getRouteOptimization: (orderId: string) => api.get(`/courier/route-optimize/${orderId}`),
  getDeliveryMethods: () => api.get('/courier/delivery-methods'),
};

// ─── Courier Gamification API ───
export const courierGamificationAPI = {
  getAchievements: () => api.get('/courier/achievements'),
  getTiers: () => api.get('/courier/tiers'),
  getLeaderboard: (period?: string) => api.get(`/courier/leaderboard${period ? `?period=${period}` : ''}`),
  claimReward: (achievementId: string) => api.post(`/courier/achievements/${achievementId}/claim`),
};

// ─── Courier Safety API ───
export const courierSafetyAPI = {
  reportEmergency: (data: any) => api.post('/courier/safety/emergency', data),
  getSupport: () => api.get('/courier/support'),
  submitSupportQuery: (query: string) => api.post('/courier/support', { query }),
  shareLocation: (data: any) => api.post('/courier/safety/location-share', data),
  getSafetyEvents: () => api.get('/courier/safety/events'),
};

// ─── Courier Quests API ───
export const courierQuestsAPI = {
  getQuests: () => api.get('/courier/quests'),
  getQuestDetails: (id: string) => api.get(`/courier/quests/${id}`),
  claimReward: (id: string) => api.post(`/courier/quests/${id}/claim`),
  getSummary: () => api.get('/courier/quests/summary'),
};

// ─── Courier Surge API ───
export const courierSurgeAPI = {
  getZones: (lat?: number, lng?: number) =>
    api.get(`/courier/surge-zones${lat && lng ? `?lat=${lat}&lng=${lng}` : ''}`),
  getHourlyDemand: () => api.get('/courier/hourly-demand'),
  getStats: () => api.get('/courier/surge-stats'),
};

// ─── Courier Scheduling API ───
export const courierScheduleAPI = {
  getSchedule: (week: string) => api.get(`/courier/schedule?week=${week}`),
  bookShift: (slotId: string, date: string) => api.post('/courier/schedule/book', { slotId, date }),
  dropShift: (slotId: string) => api.delete(`/courier/schedule/${slotId}`),
  getMyShifts: () => api.get('/courier/schedule/my-shifts'),
};

// ─── Courier Preferences API ───
export const courierPreferencesAPI = {
  get: () => api.get('/courier/preferences'),
  update: (data: any) => api.patch('/courier/preferences', data),
};

// ─── Courier Referral API ───
export const courierReferralAPI = {
  getInfo: () => api.get('/courier/referral'),
  getHistory: () => api.get('/courier/referral/history'),
  applyCode: (code: string) => api.post('/courier/referral/apply', { code }),
};

// ─── Courier Tax API ───
export const courierTaxAPI = {
  getMonthly: (month: string) => api.get(`/courier/tax/monthly?month=${month}`),
  getYearly: (year: string) => api.get(`/courier/tax/yearly?year=${year}`),
  exportReport: () => api.post('/courier/tax/export'),
};

// ─── Courier Insurance API ───
export const courierInsuranceAPI = {
  getCurrentPlan: () => api.get('/courier/insurance/plan'),
  getPlans: () => api.get('/courier/insurance/plans'),
  changePlan: (planId: string) => api.patch('/courier/insurance/plan', { planId }),
  fileClaim: (data: any) => api.post('/courier/insurance/claims', data),
  getClaims: () => api.get('/courier/insurance/claims'),
};

// ─── Courier Training API ───
export const courierTrainingAPI = {
  getModules: () => api.get('/courier/training/modules'),
  completeLesson: (moduleId: string) => api.post(`/courier/training/${moduleId}/complete-lesson`),
  getProgress: () => api.get('/courier/training/progress'),
};

// ─── Courier Maintenance API ───
export const courierMaintenanceAPI = {
  getReminders: () => api.get('/courier/reminders'),
  updateReminder: (id: string, data: any) => api.patch(`/courier/reminders/${id}`, data),
  addLog: (data: any) => api.post('/courier/maintenance-log', data),
  getLogs: () => api.get('/courier/maintenance-log'),
};

// ─── Courier Orders API ───
export const courierOrdersAPI = {
  accept: (orderId: string) => api.post(`/courier/orders/${orderId}/accept`),
  decline: (orderId: string, reason: string, details?: string) =>
    api.post(`/courier/orders/${orderId}/decline`, { reason, details }),
  updateStatus: (orderId: string, status: string) =>
    api.patch(`/courier/orders/${orderId}/status`, { status }),
  uploadProof: (orderId: string, formData: FormData) =>
    api.upload(`/courier/orders/${orderId}/delivery-proof`, formData),
  rateCustomer: (orderId: string, rating: number, tags: string[], comment?: string) =>
    api.post(`/courier/orders/${orderId}/rate-customer`, { rating, tags, comment }),
  getDetails: (orderId: string) => api.get(`/courier/orders/${orderId}`),
  getAvailable: (filter?: string) => api.get(`/courier/orders/available${filter ? `?filter=${filter}` : ''}`),
  getHistory: (status?: string, page?: number) =>
    api.get(`/courier/orders/history?${status ? `status=${status}&` : ''}page=${page || 1}`),
  getActive: () => api.get('/courier/orders/active'),
  markWaitingStarted: (orderId: string) => api.post(`/courier/orders/${orderId}/waiting-started`),
  getWaitingTime: (orderId: string) => api.get(`/courier/orders/${orderId}/waiting-time`),
};
