import { api } from './api';

// ─── Service Types ───
export type ServiceCategory = 'home' | 'health';

export interface ServiceProvider {
  id: string;
  name: string;
  category: ServiceCategory;
  serviceType: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  avatarUrl?: string;
  bio?: string;
  specializations: string[];
  pricing: {
    basePrice: number;
    currency: string;
    priceRange?: string;
  };
  availability: {
    nextAvailable: string;
    workingHours: {
      [key: string]: { open: string; close: string };
    };
  };
  location: {
    address: string;
    city: string;
    distance?: number;
  };
  verified: boolean;
  responseTime?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
}

export interface Booking {
  id: string;
  providerId: string;
  provider: ServiceProvider;
  serviceType: string;
  date: string;
  timeSlot: TimeSlot;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

export interface BookingRequest {
  providerId: string;
  serviceType: string;
  date: string;
  timeSlotId: string;
  notes?: string;
  patientName?: string;
  patientAge?: number;
  symptoms?: string;
}

// ─── Services API ───
export const servicesAPI = {
  /**
   * Get all service categories
   */
  getCategories: (): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      name: string;
      category: ServiceCategory;
      icon: string;
      description: string;
      providerCount: number;
    }>;
  }> => api.get('/services/categories'),

  /**
   * Get service providers by category
   */
  getProviders: (params: {
    category: ServiceCategory;
    serviceType?: string;
    location?: { lat: number; lng: number };
    date?: string;
    sortBy?: 'rating' | 'price' | 'distance' | 'availability';
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      providers: ServiceProvider[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> => {
    const queryParams = new URLSearchParams();
    queryParams.append('category', params.category);
    if (params.serviceType) queryParams.append('serviceType', params.serviceType);
    if (params.location) {
      queryParams.append('lat', params.location.lat.toString());
      queryParams.append('lng', params.location.lng.toString());
    }
    if (params.date) queryParams.append('date', params.date);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('limit', (params.limit || 20).toString());

    return api.get(`/services/providers?${queryParams.toString()}`);
  },

  /**
   * Get provider details
   */
  getProviderDetails: (
    providerId: string
  ): Promise<{
    success: boolean;
    data: ServiceProvider & {
      reviews: Array<{
        id: string;
        rating: number;
        comment: string;
        customerName: string;
        createdAt: string;
      }>;
      gallery: string[];
      certifications: Array<{
        name: string;
        issuedBy: string;
        year: number;
      }>;
    };
  }> => api.get(`/services/providers/${providerId}`),

  /**
   * Get provider availability
   */
  getAvailability: (
    providerId: string,
    date: string
  ): Promise<{
    success: boolean;
    data: {
      date: string;
      slots: TimeSlot[];
    };
  }> => api.get(`/services/providers/${providerId}/availability?date=${date}`),

  /**
   * Create booking
   */
  createBooking: (
    data: BookingRequest
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      bookingId: string;
      provider: ServiceProvider;
      date: string;
      timeSlot: TimeSlot;
      totalAmount: number;
    };
  }> => api.post('/services/bookings', data),

  /**
   * Get user bookings
   */
  getBookings: (params: {
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      bookings: Booking[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('limit', (params.limit || 20).toString());

    return api.get(`/services/bookings?${queryParams.toString()}`);
  },

  /**
   * Get booking details
   */
  getBookingDetails: (
    bookingId: string
  ): Promise<{
    success: boolean;
    data: Booking;
  }> => api.get(`/services/bookings/${bookingId}`),

  /**
   * Cancel booking
   */
  cancelBooking: (
    bookingId: string,
    reason?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => api.post(`/services/bookings/${bookingId}/cancel`, { reason }),

  /**
   * Reschedule booking
   */
  rescheduleBooking: (
    bookingId: string,
    data: { date: string; timeSlotId: string }
  ): Promise<{
    success: boolean;
    message: string;
    data: Booking;
  }> => api.post(`/services/bookings/${bookingId}/reschedule`, data),

  /**
   * Rate service provider
   */
  rateProvider: (
    bookingId: string,
    rating: number,
    comment?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => api.post(`/services/bookings/${bookingId}/rate`, { rating, comment }),

  /**
   * Search providers
   */
  searchProviders: (query: string): Promise<{
    success: boolean;
    data: ServiceProvider[];
  }> => api.get(`/services/search?q=${encodeURIComponent(query)}`),

  /**
   * Get featured providers
   */
  getFeaturedProviders: (
    category?: ServiceCategory
  ): Promise<{
    success: boolean;
    data: ServiceProvider[];
  }> => {
    const url = category
      ? `/services/featured?category=${category}`
      : '/services/featured';
    return api.get(url);
  },
};
