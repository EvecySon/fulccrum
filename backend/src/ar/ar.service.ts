import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArService {
  constructor(private readonly prisma: PrismaService) {}

  async getFoodPreview(itemId: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        name: true,
        images: true,
        description: true,
        price: true,
        nutritionalInfo: true,
        allergens: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    const nutrition = (item.nutritionalInfo as any) || {};
    return {
      ...item,
      imageUrl: Array.isArray(item.images) ? (item.images as any)[0] || '' : '',
      arModelUrl: '',
      servingSize: 'Regular',
      nutritionFacts: {
        calories: nutrition.calories || 0,
        protein: nutrition.protein || 0,
        carbs: nutrition.carbs || 0,
        fat: nutrition.fat || 0,
      },
    };
  }

  async getRestaurantTour(businessId: string) {
    const business = await this.prisma.businessProfile.findUnique({
      where: { userId: businessId },
      select: {
        userId: true,
        businessName: true,
        coverImageUrl: true,
        description: true,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return {
      id: business.userId,
      name: business.businessName,
      coverImage: business.coverImageUrl,
      description: business.description,
      hotspots: [],
      panoramaUrl: '',
    };
  }

  async getARNavigation(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, OR: [{ customerId: userId }, { driverId: userId }] },
      select: {
        id: true,
        status: true,
        specialInstructions: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      orderId: order.id,
      destination: '',
      arWaypoints: [],
      estimatedArrival: null,
    };
  }
}
