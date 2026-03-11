import { Injectable } from '@nestjs/common';

@Injectable()
export class PricingService {
  private readonly BASE_PRICE = 500;
  private readonly PRICE_PER_KM = 100;
  
  private readonly SIZE_MULTIPLIERS = {
    small: 1.0,
    medium: 1.5,
    large: 2.0,
  };

  async calculateDeliveryPrice(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number },
    size: string,
    speed: string,
  ) {
    const distance = this.calculateDistance(
      pickup.lat,
      pickup.lng,
      dropoff.lat,
      dropoff.lng,
    );

    let price = this.BASE_PRICE + distance * this.PRICE_PER_KM;

    const sizeMultiplier = this.SIZE_MULTIPLIERS[size] || 1.0;
    price *= sizeMultiplier;

    let speedMultiplier = 1.0;
    if (speed === 'express') {
      speedMultiplier = 1.3;
    }
    price *= speedMultiplier;

    const surgeFactor = await this.calculateSurgeFactor(pickup);
    price *= surgeFactor;

    return {
      basePrice: this.BASE_PRICE,
      distancePrice: distance * this.PRICE_PER_KM,
      sizeMultiplier,
      speedMultiplier,
      surgeFactor,
      distance: parseFloat(distance.toFixed(2)),
      totalPrice: parseFloat(price.toFixed(2)),
      breakdown: {
        base: this.BASE_PRICE,
        distance: distance * this.PRICE_PER_KM,
        sizeAdjustment: (sizeMultiplier - 1) * 100,
        speedAdjustment: (speedMultiplier - 1) * 100,
        surgeAdjustment: (surgeFactor - 1) * 100,
      },
    };
  }

  private async calculateSurgeFactor(location: { lat: number; lng: number }): Promise<number> {
    const hour = new Date().getHours();
    const day = new Date().getDay();

    const isPeakHour =
      (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
    const isWeekday = day >= 1 && day <= 5;

    if (isPeakHour && isWeekday) {
      return 1.3;
    }

    if (!isWeekday && hour >= 18 && hour <= 22) {
      return 1.2;
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
