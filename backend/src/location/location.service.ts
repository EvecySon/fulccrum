import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/services/cache.service';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  private locationBuffer: Map<string, UpdateLocationDto & { timestamp: Date }> = new Map();
  private readonly BATCH_INTERVAL_MS = 5000; // Flush to DB every 5 seconds
  private readonly CACHE_TTL = 30; // Cache location for 30 seconds

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {
    // Start batch processing
    this.startBatchProcessor();
  }

  async updateDriverLocation(driverId: string, dto: UpdateLocationDto) {
    // Store in Redis cache immediately for real-time tracking
    const locationData = {
      driverId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      accuracy: dto.accuracy,
      heading: dto.heading,
      speed: dto.speed,
      timestamp: new Date(),
    };

    // Cache in Redis (fast, for real-time queries)
    await this.cacheService.set(
      `driver:location:${driverId}`,
      locationData,
      this.CACHE_TTL,
    );

    // Buffer for batch DB write (reduces DB load)
    this.locationBuffer.set(driverId, {
      ...dto,
      timestamp: new Date(),
    });

    this.logger.debug(`Location buffered for driver ${driverId}`);

    return locationData;
  }

  /**
   * Batch processor - flushes buffered locations to database every 5 seconds
   * This reduces 6,000 writes/min to ~720 writes/min (12 batches/min)
   */
  private startBatchProcessor() {
    setInterval(async () => {
      if (this.locationBuffer.size === 0) return;

      const locations = Array.from(this.locationBuffer.entries());
      this.locationBuffer.clear();

      try {
        // Batch insert all locations
        await this.prisma.driverLocation.createMany({
          data: locations.map(([driverId, data]) => ({
            driverId,
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: data.accuracy,
            heading: data.heading,
            speed: data.speed,
            timestamp: data.timestamp,
          })),
          skipDuplicates: true,
        });

        // Update driver profiles (batch)
        const driverIds = locations.map(([driverId]) => driverId);
        await this.prisma.driverProfile.updateMany({
          where: { userId: { in: driverIds } },
          data: { lastLocationUpdate: new Date() },
        });

        this.logger.log(`Flushed ${locations.length} location updates to database`);
      } catch (error) {
        this.logger.error(`Failed to flush location batch: ${error.message}`);
        // Re-buffer failed locations for next batch
        locations.forEach(([driverId, data]) => {
          this.locationBuffer.set(driverId, data);
        });
      }
    }, this.BATCH_INTERVAL_MS);
  }

  async getDriverLocation(driverId: string) {
    // Check Redis cache first (real-time data)
    const cached = await this.cacheService.get(`driver:location:${driverId}`);
    if (cached) {
      this.logger.debug(`Location cache hit for driver ${driverId}`);
      return cached;
    }

    // Fallback to database
    const location = await this.prisma.driverLocation.findFirst({
      where: { driverId },
      orderBy: { timestamp: 'desc' },
    });

    if (!location) {
      throw new BadRequestException('No location data found for driver');
    }

    // Cache the result
    await this.cacheService.set(
      `driver:location:${driverId}`,
      location,
      this.CACHE_TTL,
    );

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
