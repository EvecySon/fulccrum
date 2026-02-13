import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SurgeService {
  constructor(private prisma: PrismaService) {}

  async getActiveSurgeZones(courierLat?: number, courierLng?: number) {
    const now = new Date();
    
    const zones = await this.prisma.surgeZone.findMany({
      where: {
        active: true,
        expiresAt: { gte: now },
      },
      orderBy: { multiplier: 'desc' },
    });

    return zones.map(zone => {
      const distance = courierLat && courierLng
        ? this.calculateDistance(courierLat, courierLng, zone.latitude, zone.longitude)
        : null;

      const expiresIn = Math.floor((zone.expiresAt.getTime() - now.getTime()) / (1000 * 60));

      return {
        id: zone.id,
        area: zone.area,
        multiplier: zone.multiplier,
        estimatedOrders: zone.estimatedOrders,
        distance,
        expiresIn,
        level: zone.level,
        coordinates: { lat: zone.latitude, lng: zone.longitude },
      };
    });
  }

  async getHourlyDemand() {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const label = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      
      let demand = 'low';
      let multiplier = 1.0;
      
      if ((hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 21)) {
        demand = 'high';
        multiplier = 1.5;
      } else if ((hour >= 7 && hour <= 10) || (hour >= 15 && hour <= 17)) {
        demand = 'medium';
        multiplier = 1.2;
      }

      return { hour, label, demand, multiplier };
    });

    return hours;
  }

  async getSurgeStats() {
    const now = new Date();
    
    const activeZones = await this.prisma.surgeZone.findMany({
      where: {
        active: true,
        expiresAt: { gte: now },
      },
    });

    const currentMultiplier = activeZones.length > 0
      ? Math.max(...activeZones.map(z => z.multiplier))
      : 1.0;

    const avgBonus = activeZones.length > 0
      ? activeZones.reduce((sum, z) => sum + (z.multiplier - 1) * 500, 0) / activeZones.length
      : 0;

    return {
      currentMultiplier,
      activeZonesCount: activeZones.length,
      avgBonus: Math.round(avgBonus),
    };
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
