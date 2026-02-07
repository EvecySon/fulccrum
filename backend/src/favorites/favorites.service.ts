import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async addFavorite(userId: string, businessId: string) {
    const business = await this.prisma.businessProfile.findUnique({
      where: { userId: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.prisma.favorite.upsert({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
      create: {
        userId,
        businessId,
      },
      update: {},
      include: {
        business: {
          select: {
            businessName: true,
            description: true,
            logoUrl: true,
            rating: true,
            deliveryFee: true,
            minimumOrderAmount: true,
          },
        },
      },
    });
  }

  async removeFavorite(userId: string, businessId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    return { message: 'Favorite removed successfully' };
  }

  async getUserFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        business: {
          select: {
            userId: true,
            businessName: true,
            description: true,
            logoUrl: true,
            coverImageUrl: true,
            rating: true,
            totalReviews: true,
            deliveryFee: true,
            minimumOrderAmount: true,
            averagePreparationTime: true,
            isOpen: true,
            cuisine: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async isFavorite(userId: string, businessId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    return { isFavorite: !!favorite };
  }
}
