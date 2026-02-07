import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getUserFavorites(@Request() req) {
    return this.favoritesService.getUserFavorites(req.user.sub);
  }

  @Post(':businessId')
  async addFavorite(@Request() req, @Param('businessId') businessId: string) {
    return this.favoritesService.addFavorite(req.user.sub, businessId);
  }

  @Delete(':businessId')
  async removeFavorite(@Request() req, @Param('businessId') businessId: string) {
    return this.favoritesService.removeFavorite(req.user.sub, businessId);
  }

  @Get('check/:businessId')
  async isFavorite(@Request() req, @Param('businessId') businessId: string) {
    return this.favoritesService.isFavorite(req.user.sub, businessId);
  }
}
