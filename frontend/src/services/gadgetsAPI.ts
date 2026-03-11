import { api } from './api';

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
   * Add to cart
   */
  addToCart: (productId: string, quantity: number): Promise<{
    success: boolean;
    message: string;
    data: CartItem;
  }> => api.post('/gadgets/cart', { productId, quantity }),

  /**
   * Get cart items
   */
  getCart: (): Promise<{
    success: boolean;
    data: {
      items: CartItem[];
      subtotal: number;
      total: number;
    };
  }> => api.get('/gadgets/cart'),

  /**
   * Update cart item quantity
   */
  updateCartItem: (itemId: string, quantity: number): Promise<{
    success: boolean;
    message: string;
  }> => api.put(`/gadgets/cart/${itemId}`, { quantity }),

  /**
   * Remove from cart
   */
  removeFromCart: (itemId: string): Promise<{
    success: boolean;
    message: string;
  }> => api.delete(`/gadgets/cart/${itemId}`),

  /**
   * Clear cart
   */
  clearCart: (): Promise<{
    success: boolean;
    message: string;
  }> => api.delete('/gadgets/cart'),

  /**
   * Create order
   */
  createOrder: (data: {
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
  }> => api.post('/gadgets/orders', data),

  /**
   * Get user orders
   */
  getOrders: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      orders: Order[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    queryParams.append('page', (params?.page || 1).toString());
    queryParams.append('limit', (params?.limit || 20).toString());

    return api.get(`/gadgets/orders?${queryParams.toString()}`);
  },

  /**
   * Get order details
   */
  getOrderDetails: (orderId: string): Promise<{
    success: boolean;
    data: Order;
  }> => api.get(`/gadgets/orders/${orderId}`),

  /**
   * Cancel order
   */
  cancelOrder: (orderId: string, reason?: string): Promise<{
    success: boolean;
    message: string;
  }> => api.post(`/gadgets/orders/${orderId}/cancel`, { reason }),

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
  }> => api.post(`/gadgets/products/${productId}/reviews`, data),

  /**
   * Get product reviews
   */
  getReviews: (productId: string, page?: number): Promise<{
    success: boolean;
    data: {
      reviews: Review[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> => api.get(`/gadgets/products/${productId}/reviews?page=${page || 1}`),

  /**
   * Mark review as helpful
   */
  markReviewHelpful: (reviewId: string): Promise<{
    success: boolean;
    message: string;
  }> => api.post(`/gadgets/reviews/${reviewId}/helpful`),

  /**
   * Get seller products (for seller dashboard)
   */
  getSellerProducts: (): Promise<{
    success: boolean;
    data: Product[];
  }> => api.get('/gadgets/seller/products'),

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
  }> => api.post('/gadgets/seller/products', data),

  /**
   * Update product listing
   */
  updateProduct: (productId: string, data: Partial<Product>): Promise<{
    success: boolean;
    message: string;
  }> => api.put(`/gadgets/seller/products/${productId}`, data),

  /**
   * Delete product listing
   */
  deleteProduct: (productId: string): Promise<{
    success: boolean;
    message: string;
  }> => api.delete(`/gadgets/seller/products/${productId}`),

  /**
   * Get seller dashboard stats
   */
  getSellerStats: (): Promise<{
    success: boolean;
    data: {
      totalProducts: number;
      totalSales: number;
      totalRevenue: number;
      averageRating: number;
      pendingOrders: number;
    };
  }> => api.get('/gadgets/seller/stats'),
};
