import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService) {}

  // Haversine formula to calculate distance between two coordinates
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async calculateDeliveryFee(
    businessLat: number,
    businessLon: number,
    customerLat: number,
    customerLon: number,
  ): Promise<{ distance: number; deliveryFee: number }> {
    const settings = await this.getActiveSettings();

    // Calculate distance in kilometers
    const distance = this.calculateDistance(
      businessLat,
      businessLon,
      customerLat,
      customerLon,
    );

    // Calculate delivery fee: base fee + (distance × per km rate)
    let deliveryFee =
      settings.baseDeliveryFee.toNumber() + distance * settings.perKmRate.toNumber();

    // Apply minimum and maximum limits
    if (deliveryFee < settings.minDeliveryFee.toNumber()) {
      deliveryFee = settings.minDeliveryFee.toNumber();
    }

    if (deliveryFee > settings.maxDeliveryFee.toNumber()) {
      deliveryFee = settings.maxDeliveryFee.toNumber();
    }

    return {
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      deliveryFee: Math.round(deliveryFee * 100) / 100,
    };
  }

  async calculateOrderFees(
    subtotal: number,
    businessLat: number,
    businessLon: number,
    customerLat: number,
    customerLon: number,
    promoDiscount: number = 0,
  ) {
    const settings = await this.getActiveSettings();

    // Calculate delivery fee based on distance
    const { distance, deliveryFee: calculatedDeliveryFee } =
      await this.calculateDeliveryFee(businessLat, businessLon, customerLat, customerLon);

    // Check for free delivery threshold
    let deliveryFee = calculatedDeliveryFee;
    if (
      settings.freeDeliveryThreshold &&
      subtotal >= settings.freeDeliveryThreshold.toNumber()
    ) {
      deliveryFee = 0;
    }

    // Calculate service fee (percentage of subtotal)
    let serviceFee = (subtotal * settings.serviceFeePercentage.toNumber()) / 100;

    // Apply minimum service fee
    if (serviceFee < settings.minServiceFee.toNumber()) {
      serviceFee = settings.minServiceFee.toNumber();
    }

    // Apply maximum service fee if set
    if (settings.maxServiceFee && serviceFee > settings.maxServiceFee.toNumber()) {
      serviceFee = settings.maxServiceFee.toNumber();
    }

    // Calculate tax (percentage of subtotal)
    const taxAmount = (subtotal * settings.taxPercentage.toNumber()) / 100;

    // Calculate total
    const total = subtotal + deliveryFee + serviceFee + taxAmount - promoDiscount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      serviceFee: Math.round(serviceFee * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      taxName: settings.taxName,
      taxPercentage: settings.taxPercentage.toNumber(),
      discountAmount: Math.round(promoDiscount * 100) / 100,
      total: Math.round(total * 100) / 100,
      distance: Math.round(distance * 100) / 100,
      currency: settings.currency,
      breakdown: {
        baseDeliveryFee: settings.baseDeliveryFee.toNumber(),
        perKmRate: settings.perKmRate.toNumber(),
        distanceCharge: Math.round((distance * settings.perKmRate.toNumber()) * 100) / 100,
        serviceFeePercentage: settings.serviceFeePercentage.toNumber(),
        freeDeliveryApplied:
          settings.freeDeliveryThreshold &&
          subtotal >= settings.freeDeliveryThreshold.toNumber(),
      },
    };
  }

  async getActiveSettings() {
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
          currency: 'NGN',
          isActive: true,
        },
      });
    }

    return settings;
  }

  async updateSettings(data: any) {
    // Deactivate all existing settings
    await this.prisma.platformSettings.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Create new active settings
    return this.prisma.platformSettings.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  async getSettings() {
    return this.getActiveSettings();
  }

  async calculatePlatformCommission(orderTotal: number) {
    const settings = await this.getActiveSettings();
    const commission =
      (orderTotal * settings.platformCommissionPercentage.toNumber()) / 100;

    return {
      orderTotal,
      commissionPercentage: settings.platformCommissionPercentage.toNumber(),
      commissionAmount: Math.round(commission * 100) / 100,
      businessEarnings: Math.round((orderTotal - commission) * 100) / 100,
    };
  }

  async previewOrderFees(
    businessId: string,
    customerAddressId: string,
    subtotal: number,
    promoCode?: string,
  ) {
    // Get business address
    const business = await this.prisma.businessProfile.findUnique({
      where: { userId: businessId },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });

    if (!business || !business.addresses[0]) {
      throw new BadRequestException('Business address not found');
    }

    // Get customer address
    const customerAddress = await this.prisma.address.findUnique({
      where: { id: customerAddressId },
    });

    if (!customerAddress) {
      throw new BadRequestException('Customer address not found');
    }

    const businessAddress = business.addresses[0];

    if (
      !businessAddress.latitude ||
      !businessAddress.longitude ||
      !customerAddress.latitude ||
      !customerAddress.longitude
    ) {
      throw new BadRequestException('Address coordinates are missing');
    }

    // Calculate promo discount if provided
    let promoDiscount = 0;
    if (promoCode) {
      // This would integrate with PromoService
      // For now, we'll leave it as 0
    }

    // Calculate all fees
    return this.calculateOrderFees(
      subtotal,
      businessAddress.latitude.toNumber(),
      businessAddress.longitude.toNumber(),
      customerAddress.latitude.toNumber(),
      customerAddress.longitude.toNumber(),
      promoDiscount,
    );
  }

  async getPackageDeliverySettings() {
    const settings = await this.getActiveSettings();
    
    return {
      basePackagePrice: settings.basePackagePrice.toNumber(),
      perKmPackageRate: settings.perKmPackageRate.toNumber(),
      packageSizeSmallMultiplier: settings.packageSizeSmallMultiplier.toNumber(),
      packageSizeMediumMultiplier: settings.packageSizeMediumMultiplier.toNumber(),
      packageSizeLargeMultiplier: settings.packageSizeLargeMultiplier.toNumber(),
      packageSizeExtraLargeMultiplier: settings.packageSizeExtraLargeMultiplier.toNumber(),
      expressSpeedMultiplier: settings.expressSpeedMultiplier.toNumber(),
      sameDaySpeedMultiplier: settings.sameDaySpeedMultiplier.toNumber(),
      scheduledSpeedMultiplier: settings.scheduledSpeedMultiplier.toNumber(),
      peakHourSurgeMultiplier: settings.peakHourSurgeMultiplier.toNumber(),
      weekendSurgeMultiplier: settings.weekendSurgeMultiplier.toNumber(),
      currency: settings.currency,
    };
  }

  async updatePackageDeliverySettings(dto: any) {
    const settings = await this.getActiveSettings();

    const updated = await this.prisma.platformSettings.update({
      where: { id: settings.id },
      data: {
        ...(dto.basePackagePrice !== undefined && { basePackagePrice: dto.basePackagePrice }),
        ...(dto.perKmPackageRate !== undefined && { perKmPackageRate: dto.perKmPackageRate }),
        ...(dto.packageSizeSmallMultiplier !== undefined && { packageSizeSmallMultiplier: dto.packageSizeSmallMultiplier }),
        ...(dto.packageSizeMediumMultiplier !== undefined && { packageSizeMediumMultiplier: dto.packageSizeMediumMultiplier }),
        ...(dto.packageSizeLargeMultiplier !== undefined && { packageSizeLargeMultiplier: dto.packageSizeLargeMultiplier }),
        ...(dto.packageSizeExtraLargeMultiplier !== undefined && { packageSizeExtraLargeMultiplier: dto.packageSizeExtraLargeMultiplier }),
        ...(dto.expressSpeedMultiplier !== undefined && { expressSpeedMultiplier: dto.expressSpeedMultiplier }),
        ...(dto.sameDaySpeedMultiplier !== undefined && { sameDaySpeedMultiplier: dto.sameDaySpeedMultiplier }),
        ...(dto.scheduledSpeedMultiplier !== undefined && { scheduledSpeedMultiplier: dto.scheduledSpeedMultiplier }),
        ...(dto.peakHourSurgeMultiplier !== undefined && { peakHourSurgeMultiplier: dto.peakHourSurgeMultiplier }),
        ...(dto.weekendSurgeMultiplier !== undefined && { weekendSurgeMultiplier: dto.weekendSurgeMultiplier }),
      },
    });

    return {
      message: 'Package delivery pricing settings updated successfully',
      settings: {
        basePackagePrice: updated.basePackagePrice.toNumber(),
        perKmPackageRate: updated.perKmPackageRate.toNumber(),
        packageSizeSmallMultiplier: updated.packageSizeSmallMultiplier.toNumber(),
        packageSizeMediumMultiplier: updated.packageSizeMediumMultiplier.toNumber(),
        packageSizeLargeMultiplier: updated.packageSizeLargeMultiplier.toNumber(),
        packageSizeExtraLargeMultiplier: updated.packageSizeExtraLargeMultiplier.toNumber(),
        expressSpeedMultiplier: updated.expressSpeedMultiplier.toNumber(),
        sameDaySpeedMultiplier: updated.sameDaySpeedMultiplier.toNumber(),
        scheduledSpeedMultiplier: updated.scheduledSpeedMultiplier.toNumber(),
        peakHourSurgeMultiplier: updated.peakHourSurgeMultiplier.toNumber(),
        weekendSurgeMultiplier: updated.weekendSurgeMultiplier.toNumber(),
      },
    };
  }
}
