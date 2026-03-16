import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('provider')
@UseGuards(JwtAuthGuard)
export class ProviderController {
  constructor(private providerService: ProviderService) {}

  @Post('register/restaurant')
  async registerRestaurant(@Request() req: any, @Body() data: any) {
    return this.providerService.registerRestaurant(req.user.sub, data);
  }

  @Post('register/service')
  async registerServiceProvider(@Request() req: any, @Body() data: any) {
    return this.providerService.registerServiceProvider(req.user.sub, data);
  }

  @Post('register/health')
  async registerHealthService(@Request() req: any, @Body() data: any) {
    return this.providerService.registerHealthService(req.user.sub, data);
  }

  @Post('register/seller')
  async registerSeller(@Request() req: any, @Body() data: any) {
    return this.providerService.registerSeller(req.user.sub, data);
  }

  @Post('register/home-service')
  async registerHomeService(@Request() req: any, @Body() data: any) {
    return this.providerService.registerHomeService(req.user.sub, data);
  }

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.providerService.getProviderProfile(req.user.sub);
  }

  @Post('menu-items')
  async addMenuItem(@Request() req: any, @Body() data: any) {
    return this.providerService.addMenuItem(req.user.sub, data);
  }

  @Post('products')
  async addProduct(@Request() req: any, @Body() data: any) {
    return this.providerService.addProduct(req.user.sub, data);
  }
}
