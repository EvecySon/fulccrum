import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async getListings(merchantId: string) {
    return this.prisma.marketplaceListing.findMany({
      where: { businessId: merchantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllActiveListings(page: number) {
    const take = 20;
    const skip = (page - 1) * take;
    const now = new Date();

    const [data, total] = await Promise.all([
      this.prisma.marketplaceListing.findMany({
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          quantity: { gt: 0 },
        },
        include: {
          merchant: {
            select: { businessName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.marketplaceListing.count({
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          quantity: { gt: 0 },
        },
      }),
    ]);

    return { data, total, page, hasMore: skip + take < total };
  }

  async createListing(merchantId: string, data: any) {
    return this.prisma.marketplaceListing.create({
      data: {
        businessId: merchantId,
        title: data.title,
        description: data.description || null,
        category: data.category || 'surplus',
        originalPrice: parseFloat(data.originalPrice) || 0,
        discountedPrice: parseFloat(data.discountedPrice) || 0,
        quantity: parseInt(data.quantity) || 1,
        images: data.images || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        tags: data.tags || null,
      },
    });
  }

  async updateListing(merchantId: string, id: string, data: any) {
    const result = await this.prisma.marketplaceListing.updateMany({
      where: { id, businessId: merchantId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.originalPrice !== undefined && { originalPrice: parseFloat(data.originalPrice) }),
        ...(data.discountedPrice !== undefined && { discountedPrice: parseFloat(data.discountedPrice) }),
        ...(data.quantity !== undefined && { quantity: parseInt(data.quantity) }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.tags !== undefined && { tags: data.tags }),
      },
    });
    if (result.count === 0) throw new NotFoundException('Listing not found');
    return { message: 'Listing updated', id };
  }

  async deleteListing(merchantId: string, id: string) {
    const result = await this.prisma.marketplaceListing.deleteMany({
      where: { id, businessId: merchantId },
    });
    if (result.count === 0) throw new NotFoundException('Listing not found');
    return { message: 'Listing deleted', id };
  }

  async toggleListing(merchantId: string, id: string) {
    const listing = await this.prisma.marketplaceListing.findFirst({
      where: { id, businessId: merchantId },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    await this.prisma.marketplaceListing.update({
      where: { id },
      data: { isActive: !listing.isActive },
    });
    return { message: 'Listing toggled', id, isActive: !listing.isActive };
  }
}
