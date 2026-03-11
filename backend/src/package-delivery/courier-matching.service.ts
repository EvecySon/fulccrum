import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CourierMatchingService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async findAndNotifyCouriers(deliveryRequest: any) {
    const pickupLocation = deliveryRequest.pickupLocation;
    const radius = 5;

    const couriers = await this.findNearbyCouriers(
      pickupLocation.lat,
      pickupLocation.lng,
      radius,
    );

    if (couriers.length === 0) {
      return;
    }

    const selectedCouriers = couriers.slice(0, 3);
    const courierIds = selectedCouriers.map((c) => c.id);

    await this.prisma.deliveryRequest.update({
      where: { id: deliveryRequest.id },
      data: { sentToCouriers: courierIds },
    });

    for (const courier of selectedCouriers) {
      await this.notifications.sendPushNotification(
        courier.id,
        'New Delivery Request',
        `Package delivery: ₦${deliveryRequest.estimatedPrice} • ${deliveryRequest.estimatedDistance}km`,
        {
          type: 'delivery_request',
          requestId: deliveryRequest.id,
          orderId: deliveryRequest.orderId,
        },
      );
    }
  }

  private async findNearbyCouriers(
    lat: number,
    lng: number,
    radiusKm: number,
  ) {
    const onlineCouriers = await this.prisma.user.findMany({
      where: {
        role: 'driver',
        driverProfile: {
          onlineStatus: true,
        },
      },
      include: {
        driverProfile: true,
      },
    });

    const couriersWithDistance = await Promise.all(
      onlineCouriers.map(async (courier) => {
        const location = await this.prisma.courierLocation.findFirst({
          where: { courierId: courier.id },
          orderBy: { timestamp: 'desc' },
        });

        if (!location) return null;

        const distance = this.calculateDistance(
          lat,
          lng,
          location.latitude,
          location.longitude,
        );

        if (distance > radiusKm) return null;

        return {
          ...courier,
          distance,
          location,
        };
      }),
    );

    return couriersWithDistance
      .filter((c) => c !== null)
      .sort((a, b) => a.distance - b.distance);
  }

  async handleCourierAcceptance(requestId: string, courierId: string) {
    const request = await this.prisma.deliveryRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== 'pending') {
      return { success: false, message: 'Request no longer available' };
    }

    await this.prisma.deliveryRequest.update({
      where: { id: requestId },
      data: {
        status: 'accepted',
        acceptedBy: courierId,
        acceptedAt: new Date(),
      },
    });

    await this.prisma.order.update({
      where: { id: request.orderId },
      data: {
        driverId: courierId,
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });

    const order = await this.prisma.order.findUnique({
      where: { id: request.orderId },
      include: { driver: true },
    });

    await this.notifications.sendPushNotification(
      order.customerId,
      'Courier Found!',
      `${order.driver.firstName} is on the way to pickup your package`,
    );

    const otherCouriers = request.sentToCouriers.filter((id) => id !== courierId);
    for (const id of otherCouriers) {
      await this.notifications.sendPushNotification(
        id,
        'Request Taken',
        'Another courier accepted this delivery',
      );
    }

    return { success: true };
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
}
