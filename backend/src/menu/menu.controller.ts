import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateModifierDto } from './dto/create-modifier.dto';
import { CreateModifierOptionDto } from './dto/create-modifier-option.dto';
import { CreateBusinessHoursDto } from './dto/create-business-hours.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private menuService: MenuService) {}

  // CATEGORIES
  @Post('categories')
  async createCategory(@Request() req: any, @Body() dto: CreateCategoryDto) {
    return this.menuService.createCategory(req.user.sub, dto);
  }

  @Get('categories')
  async getCategories(
    @Request() req: any,
    @Query('businessId') businessId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const targetBusinessId = businessId || req.user.sub;
    return this.menuService.getCategories(targetBusinessId, includeInactive === 'true');
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: Partial<CreateCategoryDto>,
  ) {
    return this.menuService.updateCategory(id, req.user.sub, dto);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string, @Request() req: any) {
    return this.menuService.deleteCategory(id, req.user.sub);
  }

  // ITEMS
  @Post('items')
  async createItem(@Request() req: any, @Body() dto: CreateItemDto) {
    return this.menuService.createItem(req.user.sub, dto);
  }

  @Get('items')
  async getItems(
    @Request() req: any,
    @Query('businessId') businessId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('includeUnavailable') includeUnavailable?: string,
  ) {
    const targetBusinessId = businessId || req.user.sub;
    return this.menuService.getItems(
      targetBusinessId,
      categoryId,
      includeUnavailable === 'true',
    );
  }

  @Get('items/:id')
  async getItem(@Param('id') id: string) {
    return this.menuService.getItem(id);
  }

  @Put('items/:id')
  async updateItem(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: Partial<CreateItemDto>,
  ) {
    return this.menuService.updateItem(id, req.user.sub, dto);
  }

  @Patch('items/:id/toggle-availability')
  async toggleItemAvailability(@Param('id') id: string, @Request() req: any) {
    return this.menuService.toggleItemAvailability(id, req.user.sub);
  }

  @Delete('items/:id')
  async deleteItem(@Param('id') id: string, @Request() req: any) {
    return this.menuService.deleteItem(id, req.user.sub);
  }

  // MODIFIERS
  @Post('modifiers')
  async createModifier(@Request() req: any, @Body() dto: CreateModifierDto) {
    return this.menuService.createModifier(req.user.sub, dto);
  }

  @Get('modifiers')
  async getModifiers(@Request() req: any, @Query('businessId') businessId?: string) {
    const targetBusinessId = businessId || req.user.sub;
    return this.menuService.getModifiers(targetBusinessId);
  }

  @Post('modifiers/:id/options')
  async addModifierOption(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: CreateModifierOptionDto,
  ) {
    return this.menuService.addModifierOption(id, req.user.sub, dto);
  }

  @Post('items/:itemId/modifiers/:modifierId')
  async linkModifierToItem(
    @Param('itemId') itemId: string,
    @Param('modifierId') modifierId: string,
    @Request() req: any,
  ) {
    return this.menuService.linkModifierToItem(itemId, modifierId, req.user.sub);
  }

  // BUSINESS HOURS
  @Post('business-hours')
  async setBusinessHours(@Request() req: any, @Body() hours: CreateBusinessHoursDto[]) {
    return this.menuService.setBusinessHours(req.user.sub, hours);
  }

  @Get('business-hours')
  async getBusinessHours(@Request() req: any, @Query('businessId') businessId?: string) {
    const targetBusinessId = (!businessId || businessId === 'me') ? req.user.sub : businessId;
    return this.menuService.getBusinessHours(targetBusinessId);
  }

  @Get('business-hours/is-open')
  async isBusinessOpen(@Request() req: any, @Query('businessId') businessId?: string) {
    const targetBusinessId = (!businessId || businessId === 'me') ? req.user.sub : businessId;
    return this.menuService.isBusinessOpen(targetBusinessId);
  }

  // INVENTORY
  @Put('inventory/:itemId')
  async updateInventory(
    @Param('itemId') itemId: string,
    @Request() req: any,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.menuService.updateInventory(itemId, req.user.sub, dto);
  }

  @Get('inventory')
  async getInventory(@Request() req: any) {
    return this.menuService.getInventory(req.user.sub);
  }

  @Get('inventory/low-stock')
  async getLowStockItems(@Request() req: any) {
    return this.menuService.getLowStockItems(req.user.sub);
  }
}
