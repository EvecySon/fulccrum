import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async createCategory(dto: CreateCategoryDto) {
    // Check if key already exists
    const existing = await this.prisma.businessCategory.findUnique({
      where: { key: dto.key },
    });

    if (existing) {
      throw new ConflictException(`Category with key '${dto.key}' already exists`);
    }

    return this.prisma.businessCategory.create({
      data: {
        key: dto.key,
        label: dto.label,
        icon: dto.icon,
        description: dto.description || '',
        color: dto.color || '#7f8c8d',
        active: dto.active !== undefined ? dto.active : true,
        sortOrder: dto.sortOrder || 99,
      },
    });
  }

  async getAllCategories() {
    return this.prisma.businessCategory.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { label: 'asc' },
      ],
    });
  }

  async getActiveCategories() {
    return this.prisma.businessCategory.findMany({
      where: { active: true },
      orderBy: [
        { sortOrder: 'asc' },
        { label: 'asc' },
      ],
      select: {
        key: true,
        label: true,
        icon: true,
        description: true,
        color: true,
        sortOrder: true,
      },
    });
  }

  async getCategoryByKey(key: string) {
    const category = await this.prisma.businessCategory.findUnique({
      where: { key },
    });

    if (!category) {
      throw new NotFoundException(`Category with key '${key}' not found`);
    }

    return category;
  }

  async updateCategory(key: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.businessCategory.findUnique({
      where: { key },
    });

    if (!category) {
      throw new NotFoundException(`Category with key '${key}' not found`);
    }

    return this.prisma.businessCategory.update({
      where: { key },
      data: dto,
    });
  }

  async deleteCategory(key: string) {
    const category = await this.prisma.businessCategory.findUnique({
      where: { key },
    });

    if (!category) {
      throw new NotFoundException(`Category with key '${key}' not found`);
    }

    // Check if any businesses are using this category
    const businessCount = await this.prisma.businessProfile.count({
      where: { businessType: key },
    });

    if (businessCount > 0) {
      throw new ConflictException(
        `Cannot delete category '${key}' because ${businessCount} business(es) are using it`,
      );
    }

    await this.prisma.businessCategory.delete({
      where: { key },
    });

    return { message: 'Category deleted successfully' };
  }
}
