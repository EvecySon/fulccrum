import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProviderService {
  constructor(private prisma: PrismaService) {}

  async registerRestaurant(userId: string, data: any) {
    const existingProfile = await this.prisma.restaurantProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new BadRequestException('Restaurant profile already exists');
    }

    // Create restaurant profile and business profile in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create restaurant profile
      const profile = await tx.restaurantProfile.create({
        data: {
          userId,
          businessName: data.businessName,
          restaurantType: data.restaurantType,
          cuisineTypes: data.cuisineTypes || [],
          description: data.description,
          businessEmail: data.businessEmail,
          businessPhone: data.businessPhone,
          address: data.address,
          city: data.city,
          state: data.state,
          latitude: data.latitude,
          longitude: data.longitude,
          deliveryRadius: data.deliveryRadius || 5,
          operatingHours: data.operatingHours || {},
          foodLicense: data.foodLicense,
          businessRegNumber: data.businessRegNumber,
          kitchenPhotos: data.kitchenPhotos || [],
        },
      });

      // Create or update business profile
      const businessProfile = await tx.businessProfile.upsert({
        where: { userId },
        create: {
          userId,
          businessName: data.businessName,
          businessType: 'RESTAURANT',
          address: data.address,
          city: data.city,
          state: data.state,
          verificationStatus: 'pending',
          isOpen: false,
        },
        update: {
          businessName: data.businessName,
          businessType: 'RESTAURANT',
          address: data.address,
          city: data.city,
          state: data.state,
        },
      });

      // Create menu categories and items if provided
      if (data.menuItems && data.menuItems.length > 0) {
        // Group menu items by category
        const categoriesMap = new Map<string, typeof data.menuItems>();
        data.menuItems.forEach((item: any) => {
          const category = item.category || 'Main Course';
          if (!categoriesMap.has(category)) {
            categoriesMap.set(category, []);
          }
          categoriesMap.get(category)!.push(item);
        });

        // Create categories and their menu items
        for (const [categoryName, items] of categoriesMap) {
          const category = await tx.menuCategory.create({
            data: {
              businessId: userId,
              name: categoryName,
              isActive: true,
            },
          });

          // Create menu items for this category
          await tx.menuItem.createMany({
            data: items.map((item: any) => ({
              businessId: userId,
              categoryId: category.id,
              name: item.name,
              description: item.description || '',
              price: parseFloat(item.price) || 0,
              isAvailable: true,
              preparationTime: 15,
            })),
          });
        }
      }

      // Update user role
      await tx.user.update({
        where: { id: userId },
        data: { 
          role: 'business_owner',
          status: 'inactive',
        },
      });

      return profile;
    });

    return {
      success: true,
      message: 'Restaurant registration submitted successfully. Your application will be reviewed within 24-48 hours.',
      profile: result,
    };
  }

  async registerServiceProvider(userId: string, data: any) {
    const existingProfile = await this.prisma.serviceProviderProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new BadRequestException('Service provider profile already exists');
    }

    const profile = await this.prisma.serviceProviderProfile.create({
      data: {
        userId,
        businessName: data.businessName,
        category: data.category,
        subCategories: data.subCategories || [],
        description: data.description,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        serviceAreas: data.serviceAreas || [],
        hourlyRate: data.hourlyRate,
        fixedPricing: data.fixedPricing || {},
        certifications: data.certifications || [],
        experience: data.experience,
        portfolio: data.portfolio || [],
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'business_owner' },
    });

    return profile;
  }

  async registerHealthService(userId: string, data: any) {
    const existingProfile = await this.prisma.healthServiceProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new BadRequestException('Health service profile already exists');
    }

    const profile = await this.prisma.healthServiceProfile.create({
      data: {
        userId,
        profession: data.profession,
        specialization: data.specialization || [],
        description: data.description,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        licenseNumber: data.licenseNumber,
        credentials: data.credentials || [],
        yearsOfExperience: data.yearsOfExperience || 0,
        consultationFee: data.consultationFee,
        availability: data.availability || {},
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'business_owner' },
    });

    return profile;
  }

  async registerSeller(userId: string, data: any) {
    const existingProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new BadRequestException('Seller profile already exists');
    }

    const profile = await this.prisma.sellerProfile.create({
      data: {
        userId,
        storeName: data.storeName,
        storeDescription: data.storeDescription,
        categories: data.categories || [],
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        storeLogo: data.storeLogo,
        bannerImage: data.bannerImage,
        returnPolicy: data.returnPolicy,
        shippingPolicy: data.shippingPolicy,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'business_owner' },
    });

    return profile;
  }

  async registerHomeService(userId: string, data: any) {
    const existingProfile = await this.prisma.homeServiceProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new BadRequestException('Home service profile already exists');
    }

    const profile = await this.prisma.homeServiceProfile.create({
      data: {
        userId,
        businessName: data.businessName,
        serviceTypes: data.serviceTypes || [],
        description: data.description,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        serviceAreas: data.serviceAreas || [],
        pricing: data.pricing || {},
        certifications: data.certifications || [],
        insuranceInfo: data.insuranceInfo,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'business_owner' },
    });

    return profile;
  }

  async getProviderProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        restaurantProfile: true,
        serviceProviderProfile: true,
        healthServiceProfile: true,
        sellerProfile: true,
        homeServiceProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      restaurant: user.restaurantProfile,
      serviceProvider: user.serviceProviderProfile,
      healthService: user.healthServiceProfile,
      seller: user.sellerProfile,
      homeService: user.homeServiceProfile,
    };
  }

  async addMenuItem(userId: string, data: any) {
    const restaurant = await this.prisma.restaurantProfile.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant profile not found');
    }

    // MenuItem uses businessId, not restaurantId
    // We need to get the user's businessProfile or create menu through business module
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { businessProfile: true },
    });

    if (!user?.businessProfile) {
      throw new BadRequestException('Business profile required to add menu items');
    }

    return this.prisma.menuItem.create({
      data: {
        businessId: user.businessProfile.userId,
        categoryId: data.categoryId, // Required field
        name: data.name,
        description: data.description,
        price: data.price,
        images: data.images || [],
        isAvailable: data.isAvailable !== false,
        preparationTime: data.preparationTime || 15,
      },
    });
  }
}
