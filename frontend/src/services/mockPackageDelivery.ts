import { PriceCalculation, DeliveryRequest, DeliveryStatus } from './packageDeliveryAPI';

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Mock price calculation
export const mockCalculatePrice = async (data: {
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  size: 'small' | 'medium' | 'large' | 'extra_large';
  speed: 'express' | 'same_day' | 'scheduled';
}): Promise<{ success: boolean; data: PriceCalculation }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const distance = calculateDistance(
    data.pickup.lat,
    data.pickup.lng,
    data.dropoff.lat,
    data.dropoff.lng
  );

  // Pricing formula
  const BASE_PRICE = 500;
  const PRICE_PER_KM = 80;
  
  const sizeMultipliers: Record<string, number> = { small: 1, medium: 1.3, large: 1.6, extra_large: 2.0 };
  const speedMultipliers = { same_day: 1, express: 1.5, scheduled: 0.8 };
  
  // Random surge between 1.0 and 1.4 (simulate demand)
  const surgeFactor = 1 + Math.random() * 0.4;

  const basePrice = BASE_PRICE;
  const distancePrice = distance * PRICE_PER_KM;
  const sizeMultiplier = sizeMultipliers[data.size];
  const speedMultiplier = speedMultipliers[data.speed];

  const subtotal = (basePrice + distancePrice) * sizeMultiplier * speedMultiplier;
  const totalPrice = Math.round(subtotal * surgeFactor);

  const sizeAdjustment = (sizeMultiplier - 1) * 100;
  const speedAdjustment = (speedMultiplier - 1) * 100;
  const surgeAdjustment = (surgeFactor - 1) * 100;

  return {
    success: true,
    data: {
      basePrice,
      distancePrice,
      sizeMultiplier,
      speedMultiplier,
      surgeFactor,
      distance,
      totalPrice,
      breakdown: {
        base: basePrice,
        distance: Math.round(distancePrice),
        sizeAdjustment,
        speedAdjustment,
        surgeAdjustment,
      },
    },
  };
};

// Mock delivery request
export const mockRequestDelivery = async (
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
}> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const distance = calculateDistance(
    data.pickupLocation.lat,
    data.pickupLocation.lng,
    data.dropoffLocation.lat,
    data.dropoffLocation.lng
  );

  const orderId = `PKG${Date.now()}`;
  const requestId = `REQ${Date.now()}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

  // Calculate estimated price
  const priceResult = await mockCalculatePrice({
    pickup: { lat: data.pickupLocation.lat, lng: data.pickupLocation.lng },
    dropoff: { lat: data.dropoffLocation.lat, lng: data.dropoffLocation.lng },
    size: data.packageSize,
    speed: data.deliverySpeed,
  });

  return {
    success: true,
    message: 'Delivery request created successfully',
    data: {
      orderId,
      requestId,
      estimatedPrice: priceResult.data.totalPrice,
      distance,
      expiresAt,
    },
  };
};

// Mock courier data
const mockCouriers = [
  {
    id: 'COU001',
    firstName: 'Chidi',
    lastName: 'Okafor',
    phoneNumber: '+2348012345678',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    rating: 4.9,
    totalDeliveries: 1247,
  },
  {
    id: 'COU002',
    firstName: 'Amina',
    lastName: 'Bello',
    phoneNumber: '+2348023456789',
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
    rating: 4.8,
    totalDeliveries: 892,
  },
  {
    id: 'COU003',
    firstName: 'Tunde',
    lastName: 'Adeyemi',
    phoneNumber: '+2348034567890',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    rating: 5.0,
    totalDeliveries: 2103,
  },
];

// Per-order mock database — keyed by orderId
const MOCK_ORDER_DB: Record<string, any> = {
  PKG1773635247769: {
    status: 'IN_TRANSIT',
    pickupAddress: 'Victoria Island, Lagos',
    dropoffAddress: 'Lekki Phase 1, Lagos',
    packageSize: 'medium',
    deliverySpeed: 'express',
    totalAmount: 2500,
    courierIdx: 0,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    eta: 12,
  },
  PKG1773535247769: {
    status: 'DELIVERED',
    pickupAddress: 'Victoria Island, Lagos',
    dropoffAddress: 'Lekki Phase 1, Lagos',
    packageSize: 'medium',
    deliverySpeed: 'express',
    totalAmount: 2500,
    courierIdx: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 18 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
  },
  PKG1773435247769: {
    status: 'DELIVERED',
    pickupAddress: 'Ikeja GRA, Lagos',
    dropoffAddress: 'Surulere, Lagos',
    packageSize: 'small',
    deliverySpeed: 'same_day',
    totalAmount: 1800,
    courierIdx: 1,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
  },
  PKG1773335247769: {
    status: 'CANCELLED',
    pickupAddress: 'Yaba, Lagos',
    dropoffAddress: 'Ajah, Lagos',
    packageSize: 'large',
    deliverySpeed: 'express',
    totalAmount: 3200,
    courierIdx: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    cancelledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(),
    cancellationReason: 'Customer requested cancellation',
  },
  PKG1773235247769: {
    status: 'DELIVERED',
    pickupAddress: 'Maryland, Lagos',
    dropoffAddress: 'Ikoyi, Lagos',
    packageSize: 'medium',
    deliverySpeed: 'express',
    totalAmount: 2200,
    courierIdx: 2,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 14 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000).toISOString(),
  },
};

// Mock delivery status
export const mockGetDeliveryStatus = async (
  orderId: string
): Promise<{ success: boolean; data: DeliveryStatus }> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const known = MOCK_ORDER_DB[orderId];

  // For unknown IDs (freshly created orders), default to ACCEPTED + searching
  const orderData = known ?? {
    status: 'ACCEPTED',
    pickupAddress: 'Your Pickup Location',
    dropoffAddress: 'Your Dropoff Location',
    packageSize: 'medium',
    deliverySpeed: 'express',
    totalAmount: 2500,
    courierIdx: Math.floor(Math.random() * mockCouriers.length),
    createdAt: new Date().toISOString(),
    acceptedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    eta: Math.floor(15 + Math.random() * 20),
  };

  const courier = orderData.courierIdx !== null && orderData.courierIdx !== undefined
    ? mockCouriers[orderData.courierIdx]
    : undefined;

  const baseLat = 6.5244 + (Math.random() - 0.5) * 0.05;
  const baseLng = 3.3792 + (Math.random() - 0.5) * 0.05;

  const isActive = ['PENDING', 'SEARCHING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(orderData.status);

  return {
    success: true,
    data: {
      order: {
        id: orderId,
        orderType: 'PACKAGE_DELIVERY',
        status: orderData.status,
        pickupLocation: { address: orderData.pickupAddress, lat: 6.4281, lng: 3.4219 },
        dropoffLocation: { address: orderData.dropoffAddress, lat: 6.4474, lng: 3.4700 },
        packageSize: orderData.packageSize,
        deliverySpeed: orderData.deliverySpeed,
        totalAmount: orderData.totalAmount,
        createdAt: orderData.createdAt,
        acceptedAt: orderData.acceptedAt,
        pickedUpAt: orderData.pickedUpAt,
        deliveredAt: orderData.deliveredAt,
        cancelledAt: orderData.cancelledAt,
        cancellationReason: orderData.cancellationReason,
        courier,
      },
      courierLocation: isActive && courier ? {
        latitude: baseLat,
        longitude: baseLng,
        heading: Math.random() * 360,
        speed: 20 + Math.random() * 30,
        timestamp: new Date().toISOString(),
      } : undefined,
      eta: isActive ? (orderData.eta ?? Math.floor(15 + Math.random() * 20)) : undefined,
    },
  };
};

// Simulate finding a courier (returns after random delay)
export const mockFindCourier = async (
  orderId: string
): Promise<{
  success: boolean;
  courier: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    avatarUrl?: string;
    rating: number;
    totalDeliveries: number;
  };
}> => {
  // Simulate searching for courier (3-8 seconds)
  const searchTime = 3000 + Math.random() * 5000;
  await new Promise((resolve) => setTimeout(resolve, searchTime));

  const courier = mockCouriers[Math.floor(Math.random() * mockCouriers.length)];

  return {
    success: true,
    courier,
  };
};
