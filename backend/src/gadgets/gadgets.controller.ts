import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GadgetsService } from './gadgets.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('gadgets')
export class GadgetsController {
  constructor(private readonly gadgetsService: GadgetsService) {}

  @Get('categories')
  async getCategories() {
    const categories = await this.gadgetsService.getCategories();

    return {
      success: true,
      data: categories,
    };
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  async createCategory(@Body() dto: CreateCategoryDto) {
    const category = await this.gadgetsService.createCategory(dto);

    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  @Post('search')
  async searchProducts(@Body() dto: SearchProductsDto) {
    const result = await this.gadgetsService.searchProducts(dto);

    return {
      success: true,
      data: result,
    };
  }

  @Get('product/:id')
  async getProductDetails(@Param('id') id: string) {
    const product = await this.gadgetsService.getProductDetails(id);

    return {
      success: true,
      data: product,
    };
  }

  @Post('product')
  @UseGuards(JwtAuthGuard)
  async createProduct(
    @Request() req: any,
    @Body() dto: CreateProductDto,
  ) {
    const user = await this.gadgetsService['prisma'].user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true },
    });

    if (!user?.businessProfile) {
      return {
        success: false,
        message: 'Business profile required to sell products',
      };
    }

    const product = await this.gadgetsService.createProduct(
      user.businessProfile.userId,
      dto,
    );

    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  @Put('product/:id')
  @UseGuards(JwtAuthGuard)
  async updateProduct(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateData: Partial<CreateProductDto>,
  ) {
    const user = await this.gadgetsService['prisma'].user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true },
    });

    if (!user?.businessProfile) {
      return {
        success: false,
        message: 'Unauthorized',
      };
    }

    const product = await this.gadgetsService.updateProduct(
      id,
      user.businessProfile.userId,
      updateData,
    );

    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };
  }

  @Post('product/:id/publish')
  @UseGuards(JwtAuthGuard)
  async publishProduct(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const user = await this.gadgetsService['prisma'].user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true },
    });

    if (!user?.businessProfile) {
      return {
        success: false,
        message: 'Unauthorized',
      };
    }

    const product = await this.gadgetsService.publishProduct(
      id,
      user.businessProfile.userId,
    );

    return {
      success: true,
      message: 'Product published successfully',
      data: product,
    };
  }

  @Get('my-products')
  @UseGuards(JwtAuthGuard)
  async getMyProducts(@Request() req: any) {
    const user = await this.gadgetsService['prisma'].user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true },
    });

    if (!user?.businessProfile) {
      return {
        success: false,
        message: 'Business profile required',
      };
    }

    const products = await this.gadgetsService.getSellerProducts(
      user.businessProfile.userId,
    );

    return {
      success: true,
      data: products,
    };
  }

  @Post('product/:id/review')
  @UseGuards(JwtAuthGuard)
  async reviewProduct(
    @Param('id') id: string,
    @Request() req: any,
    @Body('rating') rating: number,
    @Body('title') title: string,
    @Body('comment') comment: string,
    @Body('images') images: string[],
  ) {
    const review = await this.gadgetsService.reviewProduct(
      id,
      req.user.id,
      rating,
      title,
      comment,
      images || [],
    );

    return {
      success: true,
      message: 'Review submitted successfully',
      data: review,
    };
  }
}
