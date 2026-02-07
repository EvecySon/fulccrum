import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ZonesService {
  constructor(private prisma: PrismaService) {}

  // Point-in-polygon algorithm to check if coordinates are inside a zone
  private isPointInPolygon(point: { lat: number; lng: number }, polygon: any[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;

      const intersect =
        yi > point.lng !== yj > point.lng &&
        point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }
    return inside;
  }

  async createZone(businessId: string, data: any) {
    // Validate coordinates
    if (!Array.isArray(data.coordinates) || data.coordinates.length < 3) {
      throw new BadRequestException('Zone must have at least 3 coordinate points');
    }

    return this.prisma.deliveryZone.create({
      data: {
        businessId,
        name: data.name,
        description: data.description,
        coordinates: data.coordinates,
        deliveryFee: data.deliveryFee,
        minimumOrder: data.minimumOrder,
        maxOrders: data.maxOrders,
        estimatedDeliveryTime: data.estimatedDeliveryTime || 30,
        isActive: data.isActive !== false,
      },
    });
  }

  async getBusinessZones(businessId: string) {
    return this.prisma.deliveryZone.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getZone(zoneId: string) {
    const zone = await this.prisma.deliveryZone.findUnique({
      where: { id: zoneId },
      include: {
        business: {
          select: {
            businessName: true,
            businessType: true,
          },
        },
      },
    });

    if (!zone) {
      throw new NotFoundException('Delivery zone not found');
    }

    return zone;
  }

  async updateZone(zoneId: string, data: any) {
    const zone = await this.prisma.deliveryZone.findUnique({
      where: { id: zoneId },
    });

    if (!zone) {
      throw new NotFoundException('Delivery zone not found');
    }

    return this.prisma.deliveryZone.update({
      where: { id: zoneId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.coordinates && { coordinates: data.coordinates }),
        ...(data.deliveryFee !== undefined && { deliveryFee: data.deliveryFee }),
        ...(data.minimumOrder !== undefined && { minimumOrder: data.minimumOrder }),
        ...(data.maxOrders !== undefined && { maxOrders: data.maxOrders }),
        ...(data.estimatedDeliveryTime !== undefined && {
          estimatedDeliveryTime: data.estimatedDeliveryTime,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async deleteZone(zoneId: string) {
    const zone = await this.prisma.deliveryZone.findUnique({
      where: { id: zoneId },
    });

    if (!zone) {
      throw new NotFoundException('Delivery zone not found');
    }

    await this.prisma.deliveryZone.delete({
      where: { id: zoneId },
    });

    return { success: true, message: 'Delivery zone deleted successfully' };
  }

  async checkDeliveryAvailability(businessId: string, latitude: number, longitude: number) {
    const zones = await this.prisma.deliveryZone.findMany({
      where: {
        businessId,
        isActive: true,
      },
    });

    const point = { lat: latitude, lng: longitude };

    for (const zone of zones) {
      const coordinates = zone.coordinates as any[];
      if (this.isPointInPolygon(point, coordinates)) {
        return {
          available: true,
          zone: {
            id: zone.id,
            name: zone.name,
            deliveryFee: zone.deliveryFee,
            minimumOrder: zone.minimumOrder,
            estimatedDeliveryTime: zone.estimatedDeliveryTime,
          },
        };
      }
    }

    return {
      available: false,
      message: 'Delivery not available in your area',
    };
  }

  async getActiveOrdersInZone(zoneId: string) {
    const zone = await this.prisma.deliveryZone.findUnique({
      where: { id: zoneId },
    });

    if (!zone) {
      throw new NotFoundException('Delivery zone not found');
    }

    // This would require storing zoneId in orders, which we can add if needed
    // For now, return a placeholder
    return {
      zoneId,
      zoneName: zone.name,
      activeOrders: 0,
      maxOrders: zone.maxOrders,
      capacityAvailable: true,
    };
  }
}
