import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SustainabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getCarbonFootprint(userId: string) {
    const orderCount = await this.prisma.order.count({ where: { customerId: userId } });
    return {
      userId,
      totalOrders: orderCount,
      totalCO2Saved: orderCount * 0.3,
      treesEquivalent: Math.floor(orderCount * 0.02),
      ecoOrdersPercent: 0,
      monthlyTrend: [],
    };
  }

  async getOrderFootprint(userId: string, orderId: string) {
    return {
      orderId,
      co2Emitted: 1.2,
      co2Saved: 0.3,
      packagingType: 'standard',
      deliveryDistance: 0,
    };
  }

  async getEcoOptions(userId: string) {
    return [
      { key: 'no_plastic_cutlery', label: 'No Plastic Cutlery', enabled: false, impact: 'Saves 5g plastic per order' },
      { key: 'eco_packaging', label: 'Eco-Friendly Packaging', enabled: false, impact: 'Biodegradable containers' },
      { key: 'carbon_offset', label: 'Carbon Offset', enabled: false, impact: 'Offset delivery emissions' },
      { key: 'batch_delivery', label: 'Batch Delivery', enabled: false, impact: 'Combine with nearby orders' },
    ];
  }

  async updateEcoOptions(userId: string, data: any) {
    return { message: 'Eco options updated', ...data };
  }

  async getWasteReduction(userId: string) {
    return {
      userId,
      plasticSaved: 0,
      packagingSaved: 0,
      tips: [
        'Opt out of plastic cutlery to reduce waste',
        'Choose eco-friendly packaging when available',
      ],
    };
  }

  async purchaseOffset(userId: string, amount: number) {
    return {
      message: 'Carbon offset purchased',
      amount,
      co2Offset: amount * 0.5,
      certificateId: `cert-${Date.now()}`,
    };
  }
}
