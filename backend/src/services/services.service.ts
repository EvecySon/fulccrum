import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SearchProvidersDto } from './dto/search-providers.dto';

@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async registerProvider(userId: string, dto: CreateProviderDto) {
    const existingProvider = await this.prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (existingProvider) {
      throw new BadRequestException('User is already registered as a service provider');
    }

    const provider = await this.prisma.serviceProvider.create({
      data: {
        userId,
        serviceType: dto.serviceType as any,
        categories: dto.categories as any[],
        businessName: dto.businessName,
        description: dto.description,
        experience: dto.experience,
        certifications: dto.certifications || [],
        serviceArea: dto.serviceArea,
        hourlyRate: dto.hourlyRate,
        fixedRates: dto.fixedRates,
        availability: dto.availability || {},
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    return provider;
  }

  async searchProviders(dto: SearchProvidersDto) {
    const where: any = {
      serviceType: dto.serviceType as any,
      status: 'active',
    };

    if (dto.category) {
      where.categories = {
        has: dto.category as any,
      };
    }

    if (dto.minRating) {
      where.rating = {
        gte: dto.minRating,
      };
    }

    const providers = await this.prisma.serviceProvider.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { completedJobs: 'desc' },
      ],
    });

    if (dto.location && dto.maxDistance) {
      return providers.filter((provider) => {
        const distance = this.calculateDistance(
          dto.location.lat,
          dto.location.lng,
          provider.serviceArea.lat,
          provider.serviceArea.lng,
        );
        return distance <= dto.maxDistance;
      });
    }

    return providers;
  }

  async getProviderDetails(providerId: string) {
    const provider = await this.prisma.serviceProvider.findUnique({
      where: { id: providerId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        bookings: {
          where: {
            status: 'completed',
            rating: { not: null },
          },
          select: {
            rating: true,
            review: true,
            completedAt: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { completedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
  }

  async createBooking(customerId: string, dto: CreateBookingDto) {
    const provider = await this.prisma.serviceProvider.findUnique({
      where: { id: dto.providerId },
    });

    if (!provider || provider.status !== 'active') {
      throw new NotFoundException('Provider not available');
    }

    const bookingNumber = `SVC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const booking = await this.prisma.serviceBooking.create({
      data: {
        bookingNumber,
        customerId,
        providerId: dto.providerId,
        serviceType: dto.serviceType as any,
        category: dto.category as any,
        serviceDetails: dto.serviceDetails,
        scheduledDate: new Date(dto.scheduledDate),
        scheduledTime: dto.scheduledTime,
        duration: dto.duration,
        location: dto.location,
        price: dto.price,
        specialNotes: dto.specialNotes,
      },
      include: {
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    await this.notifications.sendPushNotification(
      provider.userId,
      'New Booking Request',
      `You have a new ${dto.category} booking for ${dto.scheduledDate}`,
      {
        type: 'service_booking',
        bookingId: booking.id,
      },
    );

    return booking;
  }

  async getBookingStatus(bookingId: string) {
    const booking = await this.prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateBookingStatus(bookingId: string, status: string, userId: string) {
    const booking = await this.prisma.serviceBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const updateData: any = { status };

    if (status === 'in_progress') {
      updateData.startedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
    }

    const updated = await this.prisma.serviceBooking.update({
      where: { id: bookingId },
      data: updateData,
    });

    const notifyUserId = booking.providerId === userId ? booking.customerId : booking.providerId;
    await this.notifications.sendPushNotification(
      notifyUserId,
      'Booking Status Updated',
      `Your booking status is now: ${status}`,
    );

    return updated;
  }

  async rateService(bookingId: string, rating: number, review: string) {
    const booking = await this.prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: { provider: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'completed') {
      throw new BadRequestException('Can only rate completed bookings');
    }

    await this.prisma.serviceBooking.update({
      where: { id: bookingId },
      data: { rating, review },
    });

    const avgRating = await this.prisma.serviceBooking.aggregate({
      where: {
        providerId: booking.providerId,
        rating: { not: null },
      },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.serviceProvider.update({
      where: { id: booking.providerId },
      data: {
        rating: avgRating._avg.rating || 0,
        totalReviews: avgRating._count,
      },
    });
  }

  async getCustomerBookings(customerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.serviceBooking.findMany({
        where: { customerId },
        include: {
          provider: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.serviceBooking.count({
        where: { customerId },
      }),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProviderBookings(providerId: string, status?: string) {
    const where: any = { providerId };
    if (status) {
      where.status = status;
    }

    return this.prisma.serviceBooking.findMany({
      where,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
