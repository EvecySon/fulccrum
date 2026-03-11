import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class GadgetsService {
  constructor(private prisma: PrismaService) {}

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.productCategory.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException('Category slug already exists');
    }

    return this.prisma.productCategory.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon,
        parentId: dto.parentId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async getCategories() {
    return this.prisma.productCategory.findMany({
      where: { isActive: true },
      include: {
        children: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async createProduct(sellerId: string, dto: CreateProductDto) {
    const slug = this.generateSlug(dto.name);

    const product = await this.prisma.product.create({
      data: {
        sellerId,
        categoryId: dto.categoryId,
        name: dto.name,
        slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        brand: dto.brand,
        model: dto.model,
        sku: dto.sku,
        condition: dto.condition as any,
        basePrice: dto.basePrice,
        salePrice: dto.salePrice,
        stockQuantity: dto.stockQuantity,
        images: dto.images,
        features: dto.features || [],
        specifications: dto.specifications,
        weight: dto.weight,
        dimensions: dto.dimensions,
        status: 'draft',
      },
      include: {
        category: true,
        seller: {
          select: {
            businessName: true,
            logoUrl: true,
            rating: true,
          },
        },
      },
    });

    return product;
  }

  async searchProducts(dto: SearchProductsDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'active',
    };

    if (dto.query) {
      where.OR = [
        { name: { contains: dto.query, mode: 'insensitive' } },
        { description: { contains: dto.query, mode: 'insensitive' } },
        { brand: { contains: dto.query, mode: 'insensitive' } },
      ];
    }

    if (dto.categoryId) {
      where.categoryId = dto.categoryId;
    }

    if (dto.brand) {
      where.brand = dto.brand;
    }

    if (dto.condition) {
      where.condition = dto.condition;
    }

    if (dto.minPrice || dto.maxPrice) {
      where.basePrice = {};
      if (dto.minPrice) where.basePrice.gte = dto.minPrice;
      if (dto.maxPrice) where.basePrice.lte = dto.maxPrice;
    }

    if (dto.minRating) {
      where.rating = { gte: dto.minRating };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (dto.sortBy === 'price_asc') orderBy = { basePrice: 'asc' };
    if (dto.sortBy === 'price_desc') orderBy = { basePrice: 'desc' };
    if (dto.sortBy === 'rating') orderBy = { rating: 'desc' };
    if (dto.sortBy === 'popular') orderBy = { salesCount: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          seller: {
            select: {
              businessName: true,
              logoUrl: true,
              rating: true,
            },
          },
          variants: {
            where: { isActive: true },
            take: 5,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProductDetails(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        seller: {
          select: {
            userId: true,
            businessName: true,
            logoUrl: true,
            rating: true,
            phone: true,
            email: true,
          },
        },
        variants: {
          where: { isActive: true },
        },
        reviews: {
          where: { isApproved: true, isHidden: false },
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } },
    });

    return product;
  }

  async updateProduct(productId: string, sellerId: string, updateData: Partial<CreateProductDto>) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new BadRequestException('Unauthorized');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: updateData as any,
    });
  }

  async publishProduct(productId: string, sellerId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new BadRequestException('Unauthorized');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        status: 'active',
        publishedAt: new Date(),
      },
    });
  }

  async getSellerProducts(sellerId: string) {
    return this.prisma.product.findMany({
      where: { sellerId },
      include: {
        category: true,
        _count: {
          select: { reviews: true, variants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewProduct(productId: string, customerId: string, rating: number, title: string, comment: string, images: string[]) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const review = await this.prisma.productReview.create({
      data: {
        productId,
        customerId,
        rating,
        title,
        comment,
        images,
      },
    });

    const avgRating = await this.prisma.productReview.aggregate({
      where: {
        productId,
        isApproved: true,
      },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: avgRating._avg.rating || 0,
        reviewCount: avgRating._count,
      },
    });

    return review;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
      '-' +
      Math.random().toString(36).substr(2, 6);
  }
}
