import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ArService } from './ar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ar')
@UseGuards(JwtAuthGuard)
export class ArController {
  constructor(private readonly arService: ArService) {}

  @Get('food-preview/:itemId')
  async getFoodPreview(@Param('itemId') itemId: string) {
    return this.arService.getFoodPreview(itemId);
  }

  @Get('restaurant-tour/:businessId')
  async getRestaurantTour(@Param('businessId') businessId: string) {
    return this.arService.getRestaurantTour(businessId);
  }

  @Get('navigation/:orderId')
  async getARNavigation(@Request() req, @Param('orderId') orderId: string) {
    return this.arService.getARNavigation(req.user.sub, orderId);
  }
}
