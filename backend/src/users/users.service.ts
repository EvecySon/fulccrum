import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { businessProfile: true, driverProfile: true },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    if (dto.phone && dto.phone !== user.phone) {
      const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (existing) {
        throw new ConflictException('Phone number already in use');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        status: true,
      },
    });
  }

  async updateBusinessProfile(userId: string, dto: UpdateBusinessProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { businessProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'business_owner') {
      throw new ConflictException('User is not a business owner');
    }

    if (!user.businessProfile) {
      throw new NotFoundException('Business profile not found');
    }

    const data: any = {};
    if (dto.businessName !== undefined) data.businessName = dto.businessName;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.preparationTime !== undefined) data.averagePreparationTime = dto.preparationTime;
    if (dto.maxConcurrentOrders !== undefined) data.maxConcurrentOrders = dto.maxConcurrentOrders;
    if (dto.deliveryRadius !== undefined) data.deliveryRadius = dto.deliveryRadius;
    if (dto.autoAcceptOrders !== undefined) data.autoAcceptOrders = dto.autoAcceptOrders;
    if (dto.minimumOrder !== undefined) data.minimumOrderAmount = dto.minimumOrder;
    if (dto.deliveryFee !== undefined) data.deliveryFee = dto.deliveryFee;
    if (dto.logo !== undefined) data.logoUrl = dto.logo;
    if (dto.coverImage !== undefined) data.coverImageUrl = dto.coverImage;

    return this.prisma.businessProfile.update({
      where: { userId },
      data,
    });
  }

  async deleteAccount(userId: string, password: string) {
    // Find user with password hash
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, passwordHash: true, status: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'deleted') {
      throw new BadRequestException('Account already deleted');
    }

    // Verify password for security
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    // Perform soft delete with anonymization
    await this.prisma.$transaction(async (tx) => {
      // Anonymize user data
      await tx.user.update({
        where: { id: userId },
        data: {
          status: 'deleted',
          email: `deleted_${userId}@deleted.com`,
          phone: null,
          passwordHash: null,
          firstName: 'Deleted',
          lastName: 'User',
          avatarUrl: null,
          dateOfBirth: null,
          emailVerified: false,
          phoneVerified: false,
        },
      });

      // Delete refresh tokens (log out everywhere)
      await tx.refreshToken.deleteMany({
        where: { userId },
      });

      // Delete device tokens (stop push notifications)
      await tx.deviceToken.deleteMany({
        where: { userId },
      });

      // Delete saved payment methods
      await tx.savedCard.deleteMany({
        where: { userId },
      });

      // Delete bank accounts
      await tx.bankAccount.deleteMany({
        where: { userId },
      });

      // Delete addresses
      await tx.address.deleteMany({
        where: { userId },
      });

      // Delete favorites
      await tx.favorite.deleteMany({
        where: { userId },
      });

      // Delete password reset tokens
      await tx.passwordReset.deleteMany({
        where: { userId },
      });

      // Keep orders but they're now linked to anonymized user
      // Keep reviews but they're now linked to anonymized user
      // Keep wallet transactions for legal/tax records
    });

    return {
      message: 'Account successfully deleted. All personal data has been anonymized.',
      deletedAt: new Date().toISOString(),
    };
  }

  async exportUserData(userId: string) {
    // Fetch all user data for GDPR compliance
    const user: any = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: true,
        driverProfile: true,
        businessProfile: {
          include: {
            addresses: true,
            menuCategories: {
              include: {
                items: true,
              },
            },
            businessHours: true,
          },
        },
        addresses: true,
        ordersAsCustomer: {
          include: {
            items: true,
            business: {
              select: {
                businessName: true,
              },
            },
          },
        },
        ordersAsDriver: {
          include: {
            items: true,
            business: {
              select: {
                businessName: true,
              },
            },
          },
        },
        customerReviews: {
          include: {
            business: {
              select: {
                businessName: true,
              },
            },
          },
        },
        driverReviews: true,
        favorites: {
          include: {
            business: {
              select: {
                businessName: true,
                logoUrl: true,
              },
            },
          },
        },
        wallet: {
          include: {
            withdrawalRequests: true,
          },
        },
        notifications: true,
        supportTickets: {
          include: {
            messages: true,
          },
        },
        bankAccounts: true,
        savedCards: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive fields
    const { passwordHash, ...userData } = user;

    return {
      exportDate: new Date().toISOString(),
      user: userData,
      dataCategories: {
        personalInfo: {
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth,
          role: user.role,
        },
        profile: user.customerProfile || user.driverProfile || user.businessProfile,
        addresses: user.addresses,
        ordersAsCustomer: user.ordersAsCustomer,
        ordersAsDriver: user.ordersAsDriver,
        reviews: user.customerReviews,
        favorites: user.favorites,
        wallet: user.wallet,
        notifications: user.notifications,
        supportTickets: user.supportTickets,
        paymentMethods: {
          bankAccounts: user.bankAccounts,
          savedCards: user.savedCards,
        },
      },
      metadata: {
        accountCreated: user.createdAt,
        lastUpdated: user.updatedAt,
        lastLogin: user.lastLogin,
        totalOrders: user.ordersAsCustomer.length,
        totalReviews: user.customerReviews.length,
      },
    };
  }
}
