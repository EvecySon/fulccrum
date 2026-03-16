import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MapsService } from '../maps/maps.service';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(
    private prisma: PrismaService,
    private mapsService: MapsService,
  ) {}

  async calculateDeliveryPrice(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number },
    size: string,
    speed: string,
  ) {
    // Get pricing settings from database
    const settings = await this.getPricingSettings();

    // Get real road distance using Google Maps API (with Haversine fallback)
    const { distance, source } = await this.mapsService.getRouteDistance(
      pickup,
      dropoff,
    );

    this.logger.log(`Distance calculated: ${distance.toFixed(2)} km using ${source}`);

    const basePrice = settings.basePackagePrice.toNumber();
    const pricePerKm = settings.perKmPackageRate.toNumber();
    const distancePrice = distance * pricePerKm;

    let price = basePrice + distancePrice;

    // Apply size multiplier
    const sizeMultipliers = {
      small: settings.packageSizeSmallMultiplier.toNumber(),
      medium: settings.packageSizeMediumMultiplier.toNumber(),
      large: settings.packageSizeLargeMultiplier.toNumber(),
    };
    const sizeMultiplier = sizeMultipliers[size] || 1.0;
    price *= sizeMultiplier;

    // Apply speed multiplier
    const speedMultipliers = {
      express: settings.expressSpeedMultiplier.toNumber(),
      same_day: settings.sameDaySpeedMultiplier.toNumber(),
      scheduled: settings.scheduledSpeedMultiplier.toNumber(),
    };
    const speedMultiplier = speedMultipliers[speed] || 1.0;
    price *= speedMultiplier;

    // Apply surge factor
    const surgeFactor = await this.calculateSurgeFactor(pickup, settings);
    price *= surgeFactor;

    return {
      basePrice,
      distancePrice,
      sizeMultiplier,
      speedMultiplier,
      surgeFactor,
      distance: parseFloat(distance.toFixed(2)),
      totalPrice: parseFloat(price.toFixed(2)),
      breakdown: {
        base: basePrice,
        distance: distancePrice,
        sizeAdjustment: (sizeMultiplier - 1) * 100,
        speedAdjustment: (speedMultiplier - 1) * 100,
        surgeAdjustment: (surgeFactor - 1) * 100,
      },
    };
  }

  private async getPricingSettings() {
    let settings = await this.prisma.platformSettings.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await this.prisma.platformSettings.create({
        data: {
          baseDeliveryFee: 200,
          perKmRate: 50,
          minDeliveryFee: 200,
          maxDeliveryFee: 2000,
          serviceFeePercentage: 5,
          minServiceFee: 50,
          taxPercentage: 7.5,
          taxName: 'VAT',
          platformCommissionPercentage: 15,
          basePackagePrice: 500,
          perKmPackageRate: 100,
          packageSizeSmallMultiplier: 1.0,
          packageSizeMediumMultiplier: 1.5,
          packageSizeLargeMultiplier: 2.0,
          expressSpeedMultiplier: 1.3,
          sameDaySpeedMultiplier: 1.0,
          scheduledSpeedMultiplier: 0.8,
          peakHourSurgeMultiplier: 1.3,
          weekendSurgeMultiplier: 1.2,
          currency: 'NGN',
          isActive: true,
        },
      });
    }

    return settings;
  }

  private async calculateSurgeFactor(
    location: { lat: number; lng: number },
    settings: any,
  ): Promise<number> {
    const hour = new Date().getHours();
    const day = new Date().getDay();

    const isPeakHour =
      (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
    const isWeekday = day >= 1 && day <= 5;

    if (isPeakHour && isWeekday) {
      return settings.peakHourSurgeMultiplier.toNumber();
    }

    if (!isWeekday && hour >= 18 && hour <= 22) {
      return settings.weekendSurgeMultiplier.toNumber();
    }

    return 1.0;
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
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
