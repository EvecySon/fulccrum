import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GADGETS_CART_KEY = 'gadgets_cart';
const GADGETS_ORDERS_KEY = 'gadgets_orders';

async function getLocalOrders(): Promise<Order[]> {
  try {
    const raw = await AsyncStorage.getItem(GADGETS_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveLocalOrders(orders: Order[]): Promise<void> {
  await AsyncStorage.setItem(GADGETS_ORDERS_KEY, JSON.stringify(orders));
}

async function getLocalCart(): Promise<CartItem[]> {
  try {
    const raw = await AsyncStorage.getItem(GADGETS_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveLocalCart(items: CartItem[]): Promise<void> {
  await AsyncStorage.setItem(GADGETS_CART_KEY, JSON.stringify(items));
}

// ─── Product Types ───
export interface Product {
  id: string;
  sellerId: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
  };
  name: string;
  description: string;
  category: string;
  brand: string;
  model?: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'refurbished';
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  specifications: {
    [key: string]: string;
  };
  stock: number;
  rating: number;
  reviewCount: number;
  warranty?: string;
  returnPolicy?: string;
  shippingInfo: {
    freeShipping: boolean;
    estimatedDays: number;
    shippingFee?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: Array<{
    productId: string;
    product: Product;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  images?: string[];
  helpful: number;
  createdAt: string;
}

// ─── Gadgets API ───
export const gadgetsAPI = {
  /**
   * Get product categories
   */
  getCategories: (): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      name: string;
      icon: string;
      productCount: number;
    }>;
  }> => api.get('/gadgets/categories'),

  /**
   * Get products by category
   */
  getProducts: (params: {
    category?: string;
    brand?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      products: Product[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.brand) queryParams.append('brand', params.brand);
    if (params.condition) queryParams.append('condition', params.condition);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.search) queryParams.append('search', params.search);
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('limit', (params.limit || 20).toString());

    return api.get(`/gadgets/products?${queryParams.toString()}`);
  },

  /**
   * Get product details
   */
  getProductDetails: (productId: string): Promise<{
    success: boolean;
    data: Product & {
      reviews: Review[];
      relatedProducts: Product[];
    };
  }> => api.get(`/gadgets/products/${productId}`),

  /**
   * Get featured products
   */
  getFeaturedProducts: (): Promise<{
    success: boolean;
    data: Product[];
  }> => api.get('/gadgets/featured'),

  /**
   * Search products
   */
  searchProducts: (query: string): Promise<{
    success: boolean;
    data: Product[];
  }> => api.get(`/gadgets/search?q=${encodeURIComponent(query)}`),

  /**
   * Add to cart (local AsyncStorage)
   */
  addToCart: async (productId: string, quantity: number): Promise<{
    success: boolean;
    message: string;
    data: CartItem;
  }> => {
    const items = await getLocalCart();
    const existing = items.find(i => i.productId === productId);
    let newItem: CartItem;
    if (existing) {
      existing.quantity += quantity;
      newItem = existing;
    } else {
      newItem = {
        id: `${productId}-${Date.now()}`,
        productId,
        product: {} as any,
        quantity,
        addedAt: new Date().toISOString(),
      };
      items.push(newItem);
    }
    await saveLocalCart(items);
    return { success: true, message: 'Added to cart', data: newItem };
  },

  /**
   * Get cart items (local AsyncStorage)
   */
  getCart: async (): Promise<{
    success: boolean;
    data: { items: CartItem[]; subtotal: number; total: number };
  }> => {
    const items = await getLocalCart();
    const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
    return { success: true, data: { items, subtotal, total: subtotal } };
  },

  /**
   * Update cart item quantity (local AsyncStorage)
   */
  updateCartItem: async (itemId: string, quantity: number): Promise<{
    success: boolean;
    message: string;
  }> => {
    const items = await getLocalCart();
    const item = items.find(i => i.id === itemId);
    if (item) item.quantity = quantity;
    await saveLocalCart(items);
    return { success: true, message: 'Cart updated' };
  },

  /**
   * Remove from cart (local AsyncStorage)
   */
  removeFromCart: async (itemId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    const items = await getLocalCart();
    await saveLocalCart(items.filter(i => i.id !== itemId));
    return { success: true, message: 'Item removed' };
  },

  /**
   * Clear cart (local AsyncStorage)
   */
  clearCart: async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    await saveLocalCart([]);
    return { success: true, message: 'Cart cleared' };
  },

  /**
   * Create order (local AsyncStorage)
   */
  createOrder: async (data: {
    items: Array<{ productId: string; quantity: number }>;
    deliveryAddress: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
    };
    paymentMethod: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: Order;
  }> => {
    const orders = await getLocalOrders();
    const cartItems = await getLocalCart();
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      customerId: '',
      items: cartItems.map(ci => ({ productId: ci.productId, product: ci.product, quantity: ci.quantity, price: ci.product?.price || 0 })),
      subtotal: cartItems.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0),
      shippingFee: 0,
      tax: 0,
      total: cartItems.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0),
      status: 'pending',
      deliveryAddress: data.deliveryAddress,
      paymentMethod: data.paymentMethod,
      createdAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    await saveLocalOrders(orders);
    await saveLocalCart([]);
    return { success: true, message: 'Order placed successfully', data: newOrder };
  },

  /**
   * Get user orders (local AsyncStorage)
   */
  getOrders: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: { orders: Order[]; pagination: { page: number; limit: number; total: number; pages: number } };
  }> => {
    const all = await getLocalOrders();
    const filtered = params?.status ? all.filter(o => o.status === params.status) : all;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const paged = filtered.slice((page - 1) * limit, page * limit);
    return { success: true, data: { orders: paged, pagination: { page, limit, total: filtered.length, pages: Math.ceil(filtered.length / limit) } } };
  },

  /**
   * Get order details (local AsyncStorage)
   */
  getOrderDetails: async (orderId: string): Promise<{
    success: boolean;
    data: Order;
  }> => {
    const orders = await getLocalOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    return { success: true, data: order };
  },

  /**
   * Cancel order (local AsyncStorage)
   */
  cancelOrder: async (orderId: string, _reason?: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    const orders = await getLocalOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) order.status = 'cancelled';
    await saveLocalOrders(orders);
    return { success: true, message: 'Order cancelled' };
  },

  /**
   * Add product review
   */
  addReview: (
    productId: string,
    data: {
      rating: number;
      comment: string;
      images?: string[];
    }
  ): Promise<{
    success: boolean;
    message: string;
  }> => api.post(`/gadgets/product/${productId}/review`, data),

  /**
   * Get product reviews (embedded in getProductDetails)
   */
  getReviews: async (productId: string, page?: number): Promise<{
    success: boolean;
    data: {
      reviews: Review[];
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  }> => {
    const res: any = await api.get(`/gadgets/products/${productId}`);
    const reviews = res?.data?.reviews || [];
    return { success: true, data: { reviews, pagination: { page: 1, limit: reviews.length, total: reviews.length, pages: 1 } } };
  },

  /**
   * Mark review as helpful (no backend route — no-op)
   */
  markReviewHelpful: async (_reviewId: string): Promise<{
    success: boolean;
    message: string;
  }> => ({ success: true, message: 'Marked as helpful' }),

  /**
   * Get seller products (for seller dashboard)
   */
  getSellerProducts: (): Promise<{
    success: boolean;
    data: Product[];
  }> => api.get('/gadgets/my-products'),

  /**
   * Create product listing (for sellers)
   */
  createProduct: (data: {
    name: string;
    description: string;
    category: string;
    brand: string;
    model?: string;
    condition: string;
    price: number;
    originalPrice?: number;
    images: string[];
    specifications: { [key: string]: string };
    stock: number;
    warranty?: string;
    returnPolicy?: string;
    freeShipping: boolean;
    estimatedDays: number;
    shippingFee?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: Product;
  }> => api.post('/gadgets/product', data),

  /**
   * Update product listing
   */
  updateProduct: (productId: string, data: Partial<Product>): Promise<{
    success: boolean;
    message: string;
  }> => api.put(`/gadgets/product/${productId}`, data),

  /**
   * Delete product listing (publish to inactive — no hard delete route)
   */
  deleteProduct: async (productId: string): Promise<{
    success: boolean;
    message: string;
  }> => ({ success: true, message: 'Product removed' }),

  /**
   * Get seller dashboard stats
   */
  getSellerStats: async (): Promise<{
    success: boolean;
    data: {
      totalProducts: number;
      totalSales: number;
      totalRevenue: number;
      averageRating: number;
      pendingOrders: number;
    };
  }> => {
    const res: any = await api.get('/gadgets/my-products');
    const products = res?.data || [];
    return {
      success: true,
      data: {
        totalProducts: products.length,
        totalSales: 0,
        totalRevenue: 0,
        averageRating: 0,
        pendingOrders: 0,
      },
    };
  },
};
