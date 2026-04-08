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
    additionalStops?: { lat: number; lng: number }[],
    insuranceTier?: string,
  ) {
    // Get pricing settings from database
    const settings = await this.getPricingSettings();

    // Calculate total distance across all route segments
    let totalDistance = 0;
    const waypoints = [pickup, ...(additionalStops || []), dropoff];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const { distance } = await this.mapsService.getRouteDistance(
        waypoints[i],
        waypoints[i + 1],
      );
      totalDistance += distance;
    }

    this.logger.log(`Total distance calculated: ${totalDistance.toFixed(2)} km across ${waypoints.length} waypoints`);

    const basePrice = settings.basePackagePrice.toNumber();
    const pricePerKm = settings.perKmPackageRate.toNumber();
    const distancePrice = totalDistance * pricePerKm;

    // Extra stop fee: ₦200 per additional stop
    const stopFee = (additionalStops?.length || 0) * 200;

    let price = basePrice + distancePrice + stopFee;

    // Apply size multiplier
    const sizeMultipliers: Record<string, number> = {
      small: settings.packageSizeSmallMultiplier.toNumber(),
      medium: settings.packageSizeMediumMultiplier.toNumber(),
      large: settings.packageSizeLargeMultiplier.toNumber(),
      extra_large: settings.packageSizeExtraLargeMultiplier.toNumber(),
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

    // Insurance pricing
    const insurancePricing = this.getInsurancePricing(insuranceTier);

    return {
      basePrice,
      distancePrice,
      sizeMultiplier,
      speedMultiplier,
      surgeFactor,
      stopFee,
      stopCount: additionalStops?.length || 0,
      distance: parseFloat(totalDistance.toFixed(2)),
      insuranceTier: insuranceTier || null,
      insuranceAmount: insurancePricing.amount,
      insuranceCoverage: insurancePricing.coverage,
      totalPrice: parseFloat((price + insurancePricing.amount).toFixed(2)),
      breakdown: {
        base: basePrice,
        distance: distancePrice,
        stops: stopFee,
        sizeAdjustment: (sizeMultiplier - 1) * 100,
        speedAdjustment: (speedMultiplier - 1) * 100,
        surgeAdjustment: (surgeFactor - 1) * 100,
        insurance: insurancePricing.amount,
      },
    };
  }

  getInsurancePricing(tier?: string): { amount: number; coverage: number; label: string } {
    switch (tier) {
      case 'basic':
        return { amount: 200, coverage: 50000, label: 'Basic (up to ₦50,000)' };
      case 'standard':
        return { amount: 500, coverage: 200000, label: 'Standard (up to ₦200,000)' };
      case 'premium':
        return { amount: 1000, coverage: 500000, label: 'Premium (up to ₦500,000)' };
      default:
        return { amount: 0, coverage: 50000, label: 'Free (up to ₦50,000)' };
    }
  }

  async validatePromoCode(code: string): Promise<{ valid: boolean; discount: number; message: string }> {
    // TODO: Look up promo codes from a promo table; for now support a few static codes
    const promos: Record<string, { discount: number; message: string }> = {
      'FIRST10': { discount: 10, message: '10% off your first delivery!' },
      'FULCCRUM20': { discount: 20, message: '20% off — welcome to Fulccrum!' },
    };
    const promo = promos[code.toUpperCase()];
    if (promo) return { valid: true, ...promo };
    return { valid: false, discount: 0, message: 'Invalid promo code' };
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
          packageSizeExtraLargeMultiplier: 2.5,
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
