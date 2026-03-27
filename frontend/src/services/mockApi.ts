// ─── Mock API Interceptor ───
// Returns mock data when the backend is unreachable.
// Wrap real API calls with `withMock(realCall, mockFallback)`.

import {
  mockRestaurants,
  mockMenuItems,
  mockAddresses,
  mockOrders,
  mockPromos,
  mockTrendingItems,
  mockNotifications,
  mockFees,
  mockModifierGroups,
  mockPopularSearches,
  getMenuForRestaurant,
} from './mockData';
import { resolveMediaUrl } from './api';

// Set to true to always use mock data (no backend needed)
export const USE_MOCK = false;

// Delay to simulate network latency
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const randomDelay = () => delay(200 + Math.random() * 400);

// Wrap a real API call: try real first, fall back to mock
export async function withMock<T>(realCall: () => Promise<T>, mockFallback: () => T | Promise<T>): Promise<T> {
  if (USE_MOCK) {
    await randomDelay();
    return mockFallback();
  }
  try {
    return await realCall();
  } catch (e: any) {
    // If network error (backend down), fall back to mock
    if (e?.message?.includes('Network') || e?.message?.includes('fetch') || e?.status === undefined) {
      console.log('[MockAPI] Backend unreachable, using mock data');
      await randomDelay();
      return mockFallback();
    }
    throw e;
  }
}

// ─── Normalize backend restaurant data to frontend shape ───
export function normalizeRestaurant(r: any): any {
  if (!r) return r;
  return {
    ...r,
    id: r.id || r.userId,
    name: r.name || r.businessName,
    image: resolveMediaUrl(r.image) || resolveMediaUrl(r.logoUrl) || resolveMediaUrl(r.coverImageUrl),
    deliveryTime: r.deliveryTime || r.estimatedDeliveryTime || r.averagePreparationTime,
    minimumOrder: r.minimumOrder ?? r.minimumOrderAmount,
    cuisine: r.cuisine || r.description,
  };
}

export function normalizeRestaurants(data: any[]): any[] {
  return data.map(normalizeRestaurant);
}

// ─── Normalize backend menu item data to frontend shape ───
export function normalizeMenuItem(item: any): any {
  if (!item) return item;
  return {
    ...item,
    image: resolveMediaUrl(item.image) || (Array.isArray(item.images) && item.images.length > 0 ? resolveMediaUrl(item.images[0]) : undefined),
    category: typeof item.category === 'string' ? item.category : item.category?.name || 'Uncategorized',
    prepTime: item.prepTime || (item.preparationTime ? `${item.preparationTime} min` : undefined),
    calories: item.calories || item.nutritionalInfo?.calories,
    isPopular: item.isPopular ?? item.isFeatured ?? false,
    customizations: item.customizations || [],
  };
}

export function normalizeMenuItems(data: any[]): any[] {
  return data.map(normalizeMenuItem);
}

// ─── Mock Handlers ───

export const mockSearchBusinesses = (query: string) => {
  if (!query) return mockRestaurants;
  const q = query.toLowerCase();
  return mockRestaurants.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.cuisine.toLowerCase().includes(q) ||
    r.tags.some((t: string) => t.toLowerCase().includes(q)) ||
    r.dietaryOptions?.some((d: string) => d.toLowerCase().includes(q))
  );
};

export const mockGetMenuItems = (businessId: string) => {
  return getMenuForRestaurant(businessId);
};

export const mockGetModifiers = () => mockModifierGroups;

export const mockGetAddresses = () => mockAddresses;

export const mockGetOrders = (page = 1, limit = 20) => {
  const start = (page - 1) * limit;
  return { data: mockOrders.slice(start, start + limit), total: mockOrders.length };
};

export const mockGetOrder = (orderId: string) => {
  return mockOrders.find(o => o.id === orderId) || mockOrders[0];
};

export const mockGetActivePromos = () => mockPromos;

export const mockGetTrending = () => mockTrendingItems;

export const mockGetNotifications = () => mockNotifications;

export const mockGetFees = () => mockFees;

export const mockGetPopularSearches = () => mockPopularSearches;

export const mockCreateOrder = (data: any) => {
  const newOrder = {
    id: 'ord-new-' + Date.now(),
    orderNumber: 'FUL-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    status: data.scheduledFor ? 'scheduled' : 'pending',
    business: mockRestaurants.find(r => r.id === data.businessId) ? { businessName: mockRestaurants.find(r => r.id === data.businessId)!.name, id: data.businessId } : { businessName: 'Restaurant', id: data.businessId },
    items: data.items || [],
    subtotal: data.subtotal || 0,
    deliveryFee: data.deliveryFee || 0,
    serviceFee: data.serviceFee || 0,
    taxAmount: data.taxAmount || 0,
    tipAmount: data.tipAmount || 0,
    totalAmount: data.totalAmount || 0,
    estimatedDeliveryTime: new Date(Date.now() + 2400000).toISOString(),
    createdAt: new Date().toISOString(),
    paymentMethod: data.paymentMethod || 'wallet',
    driver: null,
    deliveryAddress: mockAddresses.find(a => a.id === data.deliveryAddressId) || mockAddresses[0],
  };
  // Add to the beginning of mock orders so it appears first
  mockOrders.unshift(newOrder);
  return newOrder;
};

export const mockCancelOrder = (orderId: string) => {
  return { success: true, message: 'Order cancelled' };
};

export const mockAddTip = (orderId: string, amount: number) => {
  return { success: true, message: `₦${amount} tip added` };
};

export const mockValidatePromo = (code: string, orderAmount: number) => {
  const promo = mockPromos.find(p => p.code === code);
  if (!promo) return { valid: false, message: 'Invalid promo code' };
  if (promo.minOrder && orderAmount < promo.minOrder) return { valid: false, message: `Minimum order ₦${promo.minOrder} required` };
  const discount = promo.discountPercent ? Math.round(orderAmount * promo.discountPercent / 100) : (promo.discountAmount || 0);
  return { valid: true, discount, code: promo.code, description: promo.title };
};

export const mockReorder = (orderId: string) => {
  const original = mockOrders.find(o => o.id === orderId);
  if (!original) return mockCreateOrder({});
  return mockCreateOrder({
    businessId: original.business.id,
    items: original.items,
    subtotal: original.subtotal,
    deliveryFee: original.deliveryFee,
    serviceFee: original.serviceFee,
    taxAmount: original.taxAmount,
    totalAmount: original.totalAmount,
    paymentMethod: original.paymentMethod,
  });
};

export const mockLogin = (email: string, password: string) => {
  // Mock user database
  const users = [
    { id: 'customer-1', email: 'customer1@test.com', firstName: 'Ada', lastName: 'Okafor', role: 'customer', phone: '+234 801 234 5678' },
    { id: 'customer-2', email: 'customer2@test.com', firstName: 'Chidi', lastName: 'Nwosu', role: 'customer', phone: '+234 802 345 6789' },
    { id: 'customer-3', email: 'customer3@test.com', firstName: 'Zainab', lastName: 'Ibrahim', role: 'customer', phone: '+234 803 456 7890' },
    { id: 'merchant-1', email: 'pizza@test.com', firstName: 'Tony', lastName: 'Pizza', role: 'business_owner', phone: '+234 807 890 1234' },
    { id: 'merchant-2', email: 'burger@test.com', firstName: 'Bob', lastName: 'Burger', role: 'business_owner', phone: '+234 808 901 2345' },
    { id: 'merchant-3', email: 'jollof@test.com', firstName: 'Mama', lastName: 'Jollof', role: 'business_owner', phone: '+234 809 012 3456' },
    { id: 'driver-1', email: 'driver1@test.com', firstName: 'Emeka', lastName: 'Okoro', role: 'driver', phone: '+234 805 678 9012' },
    { id: 'driver-2', email: 'driver2@test.com', firstName: 'Fatima', lastName: 'Bello', role: 'driver', phone: '+234 806 789 0123' },
    { id: 'admin-1', email: 'admin@fulccrum.com', firstName: 'System', lastName: 'Admin', role: 'admin', phone: '+234 800 000 0000' },
  ];

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Accept any password in mock mode
  return {
    accessToken: 'mock-access-token-' + user.id,
    refreshToken: 'mock-refresh-token-' + user.id,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      avatarUrl: undefined,
    },
    verified: true,
  };
};
