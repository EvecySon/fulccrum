import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchAll(query: string) {
    const searchTerm = `%${query}%`;

    const [businesses, menuItems] = await Promise.all([
      this.prisma.businessProfile.findMany({
        where: {
          OR: [
            { businessName: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          verificationStatus: 'approved',
        },
        take: 20,
        select: {
          userId: true,
          businessName: true,
          description: true,
          logoUrl: true,
          rating: true,
          deliveryFee: true,
          minimumOrderAmount: true,
        },
      }),
      this.prisma.menuItem.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          isAvailable: true,
        },
        take: 20,
        include: {
          category: {
            select: {
              name: true,
              businessId: true,
            },
          },
        },
      }),
    ]);

    return {
      businesses,
      menuItems,
      total: businesses.length + menuItems.length,
    };
  }

  async searchBusinesses(query: string) {
    return this.prisma.businessProfile.findMany({
      where: {
        OR: [
          { businessName: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        verificationStatus: 'approved',
      },
      take: 50,
      select: {
        userId: true,
        businessName: true,
        description: true,
        logoUrl: true,
        coverImageUrl: true,
        rating: true,
        deliveryFee: true,
        minimumOrderAmount: true,
        averagePreparationTime: true,
        isOpen: true,
        priceRange: true,
        estimatedDeliveryTime: true,
        businessHours: true,
      },
    });
  }

  async listBusinesses() {
    return this.prisma.businessProfile.findMany({
      where: { verificationStatus: 'approved' },
      orderBy: { businessName: 'asc' },
      take: 50,
      select: {
        userId: true,
        businessName: true,
        description: true,
        logoUrl: true,
        coverImageUrl: true,
        rating: true,
        deliveryFee: true,
        minimumOrderAmount: true,
        averagePreparationTime: true,
        isOpen: true,
        priceRange: true,
        estimatedDeliveryTime: true,
        businessHours: true,
      },
    });
  }

  async searchMenuItems(query: string, businessId?: string) {
    return this.prisma.menuItem.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          businessId ? { businessId } : {},
          { isAvailable: true },
        ],
      },
      take: 50,
      include: {
        category: {
          select: {
            name: true,
            businessId: true,
          },
        },
      },
    });
  }
}
