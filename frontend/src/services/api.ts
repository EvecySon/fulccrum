import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:3001';

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
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    await saveTokens(data.access_token, data.refresh_token);
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

  delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),

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

  forgotPassword: (method: 'email' | 'phone', value: string) =>
    api.post('/auth/forgot-password', { [method]: value }),

  verifyOTP: (code: string, email?: string, phone?: string) =>
    api.post('/auth/verify-otp', { code, email, phone }),

  resetPassword: (code: string, newPassword: string) =>
    api.post('/auth/reset-password', { code, newPassword }),

  resendOTP: (email?: string, phone?: string) =>
    api.post('/auth/resend-otp', { email, phone }),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// ─── Users API ───
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: { firstName?: string; lastName?: string; email?: string; phone?: string; avatar?: string }) =>
    api.patch('/users/profile', data),
  updateBusinessProfile: (data: any) => api.patch('/users/business/profile', data),
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
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  getMyOrders: (page = 1, limit = 20) => api.get(`/orders/customer/my-orders?page=${page}&limit=${limit}`),
  getDriverOrders: (status?: string) => api.get(`/orders/driver/assigned${status ? `?status=${status}` : ''}`),
  getBusinessOrders: (businessId: string, page = 1, limit = 20) =>
    api.get(`/orders/business/${businessId}?page=${page}&limit=${limit}`),
  assignDriver: (orderId: string, driverId: string) =>
    api.patch(`/orders/${orderId}/assign-driver`, { driverId }),
  getAvailableDeliveries: (page = 1, limit = 20) =>
    api.get(`/orders/available/deliveries?page=${page}&limit=${limit}`),
};

// ─── Menu API ───
export const menuAPI = {
  getCategories: (businessId: string) => api.get(`/menu/categories?businessId=${businessId}`),
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
};

// ─── Wallet API ───
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  requestWithdrawal: (amount: number) => api.post('/wallet/withdraw/request', { amount }),
  confirmWithdrawal: (requestId: string, confirmationCode: string) =>
    api.post('/wallet/withdraw/confirm', { requestId, confirmationCode }),
  withdrawalHistory: (page = 1, limit = 20) => api.get(`/wallet/withdraw/history?page=${page}&limit=${limit}`),
  cancelWithdrawal: (requestId: string) => api.post('/wallet/withdraw/cancel', { requestId }),
};

// ─── Reviews API ───
export const reviewsAPI = {
  create: (data: any) => api.post('/reviews', data),
  get: (id: string) => api.get(`/reviews/${id}`),
  getBusinessReviews: (businessId: string, page = 1) => api.get(`/reviews/business/${businessId}?page=${page}`),
  getDriverReviews: (driverId: string, page = 1) => api.get(`/reviews/driver/${driverId}?page=${page}`),
  getMyReviews: (page = 1) => api.get(`/reviews/customer/my-reviews?page=${page}`),
  respond: (id: string, response: string) => api.post(`/reviews/${id}/respond`, { response }),
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

// ─── Notifications API ───
export const notificationsAPI = {
  getAll: (unreadOnly = false, page = 1) =>
    api.get(`/notifications?unreadOnly=${unreadOnly}&page=${page}`),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  registerDevice: (token: string, platform: string, deviceId?: string) =>
    api.post('/notifications/devices/register', { token, platform, deviceId }),
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
  dashboard: () => api.get('/analytics/dashboard'),
  revenue: (days = 30) => api.get(`/analytics/revenue?days=${days}`),
  topPerformers: (type: 'drivers' | 'businesses', limit = 10) =>
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
  getPendingMerchants: (page = 1) => api.get(`/admin/merchants/pending?page=${page}`),
  approveMerchant: (merchantId: string) => api.patch(`/admin/merchants/${merchantId}/approve`),
  rejectMerchant: (merchantId: string) => api.patch(`/admin/merchants/${merchantId}/reject`),
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
