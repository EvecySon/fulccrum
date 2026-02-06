import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async updateDriverLocation(driverId: string, dto: UpdateLocationDto) {
    // Verify driver exists and is online
    const driver = await this.prisma.driverProfile.findUnique({
      where: { userId: driverId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    // Create location record
    const location = await this.prisma.driverLocation.create({
      data: {
        driverId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        heading: dto.heading,
        speed: dto.speed,
      },
    });

    // Update driver profile with last location update time
    await this.prisma.driverProfile.update({
      where: { userId: driverId },
      data: { lastLocationUpdate: new Date() },
    });

    return location;
  }

  async getDriverLocation(driverId: string) {
    const location = await this.prisma.driverLocation.findFirst({
      where: { driverId },
      orderBy: { timestamp: 'desc' },
    });

    if (!location) {
      throw new BadRequestException('No location data found for driver');
    }

    return location;
  }

  async getDriverLocationHistory(driverId: string, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.prisma.driverLocation.findMany({
      where: {
        driverId,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async getNearbyDrivers(latitude: number, longitude: number, radiusKm = 5) {
    // Get all online drivers with recent location updates (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const drivers = await this.prisma.driverProfile.findMany({
      where: {
        onlineStatus: true,
        lastLocationUpdate: { gte: fiveMinutesAgo },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Get latest location for each driver
    const driversWithLocations = await Promise.all(
      drivers.map(async (driver) => {
        const location = await this.prisma.driverLocation.findFirst({
          where: { driverId: driver.userId },
          orderBy: { timestamp: 'desc' },
        });

        if (!location) return null;

        // Calculate distance using Haversine formula
        const distance = this.calculateDistance(
          latitude,
          longitude,
          Number(location.latitude),
          Number(location.longitude),
        );

        if (distance > radiusKm) return null;

        return {
          driver: {
            id: driver.userId,
            name: `${driver.user.firstName} ${driver.user.lastName}`,
            phone: driver.user.phone,
            rating: Number(driver.rating),
            vehicleType: driver.vehicleType,
          },
          location: {
            latitude: Number(location.latitude),
            longitude: Number(location.longitude),
            accuracy: location.accuracy,
            timestamp: location.timestamp,
          },
          distance: Math.round(distance * 100) / 100, // Round to 2 decimals
        };
      }),
    );

    // Filter out null results and sort by distance
    return driversWithLocations
      .filter((d) => d !== null)
      .sort((a, b) => a.distance - b.distance);
  }

  async trackOrderDelivery(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (!order.driverId) {
      throw new BadRequestException('No driver assigned to this order');
    }

    const location = await this.getDriverLocation(order.driverId);

    return {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      },
      driver: order.driver,
      location: {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        accuracy: location.accuracy,
        heading: location.heading,
        speed: location.speed,
        timestamp: location.timestamp,
      },
    };
  }

  async setDriverOnlineStatus(driverId: string, isOnline: boolean) {
    return this.prisma.driverProfile.update({
      where: { userId: driverId },
      data: { onlineStatus: isOnline },
    });
  }

  // Haversine formula to calculate distance between two coordinates
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async cleanupOldLocations(daysToKeep = 7) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await this.prisma.driverLocation.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
      },
    });

    return {
      deleted: result.count,
      message: `Deleted ${result.count} location records older than ${daysToKeep} days`,
    };
  }
}
