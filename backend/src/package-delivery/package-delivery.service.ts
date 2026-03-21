import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from './pricing.service';
import { CourierMatchingService } from './courier-matching.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RequestDeliveryDto } from './dto/request-delivery.dto';

@Injectable()
export class PackageDeliveryService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
    private courierMatching: CourierMatchingService,
    private notifications: NotificationsService,
  ) {}

  async calculatePrice(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number },
    size: string,
    speed: string,
  ) {
    return this.pricingService.calculateDeliveryPrice(
      pickup,
      dropoff,
      size,
      speed,
    );
  }

  async requestDelivery(customerId: string, dto: RequestDeliveryDto) {
    const pricing = await this.pricingService.calculateDeliveryPrice(
      { lat: dto.pickupLocation.lat, lng: dto.pickupLocation.lng },
      { lat: dto.dropoffLocation.lat, lng: dto.dropoffLocation.lng },
      dto.packageSize,
      dto.deliverySpeed,
    );

    const orderNumber = `PKG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        orderType: 'package_delivery',
        customerId,
        pickupLocation: dto.pickupLocation as any,
        dropoffLocation: dto.dropoffLocation as any,
        packageSize: dto.packageSize as any,
        packageWeight: dto.packageWeight,
        packageDescription: dto.packageDescription,
        deliverySpeed: dto.deliverySpeed as any,
        specialInstructions: dto.specialInstructions,
        totalAmount: pricing.totalPrice,
        basePrice: pricing.basePrice,
        distancePrice: pricing.distancePrice,
        sizeMultiplier: pricing.sizeMultiplier,
        surgeFactor: pricing.surgeFactor,
        subtotal: pricing.totalPrice,
        deliveryFee: 0,
        serviceFee: 0,
        taxAmount: 0,
        status: 'pending',
        paymentStatus: 'pending',
      },
    });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const deliveryRequest = await this.prisma.deliveryRequest.create({
      data: {
        orderId: order.id,
        pickupLocation: dto.pickupLocation as any,
        dropoffLocation: dto.dropoffLocation as any,
        packageSize: dto.packageSize as any,
        estimatedPrice: pricing.totalPrice,
        estimatedDistance: pricing.distance,
        expiresAt,
      },
    });

    await this.courierMatching.findAndNotifyCouriers(deliveryRequest);

    return {
      orderId: order.id,
      requestId: deliveryRequest.id,
      estimatedPrice: pricing.totalPrice,
      distance: pricing.distance,
      expiresAt,
    };
  }

  async getDeliveryStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
        deliveryRequest: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Delivery not found');
    }

    let courierLocation = null;
    if (order.driverId) {
      courierLocation = await this.prisma.courierLocation.findFirst({
        where: { courierId: order.driverId },
        orderBy: { timestamp: 'desc' },
      });
    }

    return {
      order,
      courierLocation,
      eta: courierLocation ? this.calculateETA(courierLocation, order) : null,
    };
  }

  async cancelDelivery(orderId: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Delivery not found');
    }

    if (order.customerId !== customerId) {
      throw new BadRequestException('Unauthorized');
    }

    if (order.status === 'delivered') {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });

    await this.prisma.deliveryRequest.updateMany({
      where: { orderId },
      data: { status: 'cancelled' },
    });

    if (order.driverId) {
      await this.notifications.sendPushNotification(
        order.driverId,
        'Delivery Cancelled',
        'The customer has cancelled the delivery',
      );
    }
  }

  async rateDelivery(orderId: string, rating: number, feedback?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Delivery not found');
    if (!order.driverId) throw new BadRequestException('No courier assigned to this order');
    if (order.status !== 'delivered') throw new BadRequestException('Can only rate delivered orders');

    // Store rating + feedback on the order itself
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        customerRating: rating,
        customerFeedback: feedback ?? null,
        ratedAt: new Date(),
      } as any,
    });

    // Recalculate and persist rolling average on the courier's profile
    await this.updateCourierRating(order.driverId, rating);

    // Notify the courier they received a rating
    await this.notifications.sendPushNotification(
      order.driverId,
      'New Rating Received',
      feedback
        ? `You received a ${rating}-star rating: "${feedback}"`
        : `You received a ${rating}-star rating from a customer!`,
    );
  }

  async getHistory(customerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [deliveries, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          customerId,
          orderType: 'package_delivery',
        },
        include: {
          driver: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({
        where: {
          customerId,
          orderType: 'package_delivery',
        },
      }),
    ]);

    return {
      deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private calculateETA(courierLocation: any, order: any): number {
    const avgSpeed = 30;
    const distance = this.calculateDistance(
      courierLocation.latitude,
      courierLocation.longitude,
      order.dropoffLocation.lat,
      order.dropoffLocation.lng,
    );
    return Math.ceil((distance / avgSpeed) * 60);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async updateCourierRating(courierId: string, newRating: number) {
    // Compute rolling average across all rated package-delivery orders for this courier
    const ratedOrders = await this.prisma.$queryRaw<{ avg_rating: number; count: bigint }[]>`
      SELECT AVG((customer_rating)::float) as avg_rating, COUNT(*) as count
      FROM orders
      WHERE driver_id = ${courierId}::uuid
        AND order_type = 'package_delivery'
        AND customer_rating IS NOT NULL
    `;

    const avg = ratedOrders[0]?.avg_rating ?? newRating;
    const rounded = Math.round(avg * 10) / 10;

    await this.prisma.driverProfile.upsert({
      where: { userId: courierId },
      update: { rating: rounded },
      create: {
        userId: courierId,
        vehicleType: 'motorcycle',
        rating: rounded,
      },
    });
  }
}
