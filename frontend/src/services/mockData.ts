// ─── Mock Data for Customer App Testing ───
// This file provides realistic mock data for all customer-facing screens
// when the backend is not running.
// NOTE: Mock data cleared - using real backend with seeded users for fresh testing

// ─── Restaurants ───
export const mockRestaurants: any[] = [];

// ─── Menu Items (per restaurant) ───
export const mockMenuItems: Record<string, any[]> = {};

// ─── Addresses ───
export const mockAddresses: any[] = [];

// ─── Orders ───
export const mockOrders: any[] = [];

// ─── Promos / Deals ───
export const mockPromos: any[] = [];

// ─── Trending Items ───
export const mockTrendingItems: any[] = [];

// ─── Notifications ───
export const mockNotifications: any[] = [];

// ─── Reviews ───
export const mockReviews: any[] = [];

// ─── Popular Searches ───
export const mockPopularSearches: string[] = [];

// ─── Fees ───
export const mockFees = {
  deliveryFee: 500,
  serviceFee: 200,
  taxRate: 0.075,
};

// ─── Modifier Groups ───
export const mockModifierGroups: any[] = [];

// ─── Helper: Get menu items for a restaurant ───
export const getMenuForRestaurant = (restaurantId: string) => {
  return mockMenuItems[restaurantId] || [];
};
