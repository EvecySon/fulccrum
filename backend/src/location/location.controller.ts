import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { LocationService } from './location.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('location')
@UseGuards(JwtAuthGuard)
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Post('driver/update')
  async updateLocation(@Request() req: any, @Body() dto: UpdateLocationDto) {
    return this.locationService.updateDriverLocation(req.user.sub, dto);
  }

  @Get('driver/current')
  async getCurrentLocation(@Request() req: any) {
    return this.locationService.getDriverLocation(req.user.sub);
  }

  @Get('driver/:driverId')
  async getDriverLocation(@Param('driverId') driverId: string) {
    return this.locationService.getDriverLocation(driverId);
  }

  @Get('driver/:driverId/history')
  async getLocationHistory(
    @Param('driverId') driverId: string,
    @Query('hours') hours?: string,
  ) {
    return this.locationService.getDriverLocationHistory(
      driverId,
      hours ? parseInt(hours) : 24,
    );
  }

  @Post('driver/online')
  async setOnlineStatus(@Request() req: any, @Body('isOnline') isOnline: boolean) {
    return this.locationService.setDriverOnlineStatus(req.user.sub, isOnline);
  }

  @Get('nearby')
  async getNearbyDrivers(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius?: string,
  ) {
    return this.locationService.getNearbyDrivers(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 5,
    );
  }

  @Get('track/order/:orderId')
  async trackOrder(@Param('orderId') orderId: string) {
    return this.locationService.trackOrderDelivery(orderId);
  }
}
