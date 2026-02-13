import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  // Public endpoint - get active categories only
  @Get()
  async getActiveCategories() {
    return this.categoriesService.getActiveCategories();
  }

  // Admin endpoints - require admin role
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllCategories() {
    return this.categoriesService.getAllCategories();
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Get('admin/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getCategoryByKey(@Param('key') key: string) {
    return this.categoriesService.getCategoryByKey(key);
  }

  @Patch('admin/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateCategory(
    @Param('key') key: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(key, dto);
  }

  @Delete('admin/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteCategory(@Param('key') key: string) {
    return this.categoriesService.deleteCategory(key);
  }
}
