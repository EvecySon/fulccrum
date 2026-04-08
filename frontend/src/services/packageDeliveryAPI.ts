import { api } from './api';

// ─── Package Delivery Types ───
export interface Location {
  lat: number;
  lng: number;
  address: string;
  contactName: string;
  contactPhone: string;
}

export interface PriceCalculation {
  basePrice: number;
  distancePrice: number;
  sizeMultiplier: number;
  speedMultiplier: number;
  surgeFactor: number;
  stopFee: number;
  stopCount: number;
  distance: number;
  insuranceTier: string | null;
  insuranceAmount: number;
  insuranceCoverage: number;
  totalPrice: number;
  breakdown: {
    base: number;
    distance: number;
    stops: number;
    sizeAdjustment: number;
    speedAdjustment: number;
    surgeAdjustment: number;
    insurance: number;
  };
}

export interface DeliveryRequest {
  pickupLocation: Location;
  dropoffLocation: Location;
  additionalStops?: Location[];
  packageSize: 'small' | 'medium' | 'large' | 'extra_large';
  deliverySpeed: 'express' | 'same_day' | 'scheduled';
  scheduledTime?: string;
  packageDescription?: string;
  packageWeight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  specialInstructions?: string;
  paymentMethod?: string;
  promoCode?: string;
  insuranceTier?: 'basic' | 'standard' | 'premium';
}

export interface DeliveryStatus {
  order: {
    id: string;
    orderType: string;
    status: string;
    pickupLocation: any;
    dropoffLocation: any;
    packageSize: string;
    deliverySpeed: string;
    totalAmount: number;
    createdAt: string;
    acceptedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    courier?: {
      id: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      avatarUrl?: string;
      rating?: number;
    };
  };
  courierLocation?: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    timestamp: string;
  };
  eta?: number; // minutes
}

export interface DeliveryHistory {
  deliveries: Array<{
    id: string;
    status: string;
    pickupLocation: any;
    dropoffLocation: any;
    packageSize: string;
    totalAmount: number;
    createdAt: string;
    deliveredAt?: string;
    courier?: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── Package Delivery API ───
export const packageDeliveryAPI = {
  /**
   * Calculate delivery price
   */
  calculatePrice: (data: {
    pickup: { lat: number; lng: number };
    dropoff: { lat: number; lng: number };
    size: 'small' | 'medium' | 'large' | 'extra_large';
    speed: 'express' | 'same_day' | 'scheduled';
    additionalStops?: { lat: number; lng: number }[];
    insuranceTier?: string;
  }): Promise<{ success: boolean; data: PriceCalculation }> =>
    api.post('/package-delivery/calculate-price', data),

  /**
   * Validate a promo code
   */
  validatePromo: (
    code: string
  ): Promise<{ success: boolean; data: { valid: boolean; discount: number; message: string } }> =>
    api.post('/package-delivery/validate-promo', { code }),

  /**
   * Get delivery proofs (photos) for an order
   */
  getDeliveryProofs: (
    orderId: string
  ): Promise<{ success: boolean; data: Array<{ id: string; photoUrl: string; notes?: string; type: string; createdAt: string }> }> =>
    api.get(`/package-delivery/${orderId}/proofs`),

  /**
   * Request package delivery
   */
  requestDelivery: (
    data: DeliveryRequest
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      orderId: string;
      requestId: string;
      estimatedPrice: number;
      distance: number;
      expiresAt: string;
    };
  }> => api.post('/package-delivery/request', data),

  /**
   * Get delivery status and tracking
   */
  getDeliveryStatus: (
    orderId: string
  ): Promise<{ success: boolean; data: DeliveryStatus }> =>
    api.get(`/package-delivery/${orderId}/status`),

  /**
   * Accept a delivery request (called by courier/driver)
   */
  acceptDelivery: (
    requestId: string
  ): Promise<{ success: boolean; message: string }> =>
    api.post(`/package-delivery/requests/${requestId}/accept`, {}),

  /**
   * Mark order as picked up (called by courier)
   */
  markPickedUp: (
    orderId: string
  ): Promise<{ success: boolean; message: string }> =>
    api.post(`/package-delivery/${orderId}/mark-picked-up`, {}),

  /**
   * Mark order as delivered (called by courier)
   */
  markDelivered: (
    orderId: string
  ): Promise<{ success: boolean; message: string }> =>
    api.post(`/package-delivery/${orderId}/mark-delivered`, {}),

  /**
   * Cancel delivery
   */
  cancelDelivery: (
    orderId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; data?: { cancellationFee: number } }> =>
    api.post(`/package-delivery/${orderId}/cancel`, { reason }),

  /**
   * Rate delivery
   */
  rateDelivery: (
    orderId: string,
    rating: number,
    feedback?: string
  ): Promise<{ success: boolean; message: string }> =>
    api.post(`/package-delivery/${orderId}/rate`, { rating, feedback }),

  /**
   * Get active (in-progress) orders for the current user
   */
  getActiveOrders: (): Promise<{ success: boolean; data: any[] }> =>
    api.get('/package-delivery/active'),

  /**
   * Get delivery history
   */
  getHistory: (
    page: number = 1,
    limit: number = 20
  ): Promise<{ success: boolean; data: DeliveryHistory }> =>
    api.get(`/package-delivery/history?page=${page}&limit=${limit}`),
};
