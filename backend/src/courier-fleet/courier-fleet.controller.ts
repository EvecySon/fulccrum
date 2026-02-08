import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { CourierFleetService } from './courier-fleet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('courier')
@UseGuards(JwtAuthGuard)
export class CourierFleetController {
  constructor(private readonly fleetService: CourierFleetService) {}

  @Get('performance')
  async getPerformance(@Request() req) {
    return this.fleetService.getPerformance(req.user.sub);
  }

  @Get('predictions')
  async getPredictions(@Request() req) {
    return this.fleetService.getPredictions(req.user.sub);
  }

  @Get('dispatch')
  async getDispatch(@Request() req) {
    return this.fleetService.getDispatch(req.user.sub);
  }

  @Get('route-optimize/:orderId')
  async getRouteOptimization(@Request() req, @Param('orderId') orderId: string) {
    return this.fleetService.getRouteOptimization(req.user.sub, orderId);
  }

  @Get('delivery-methods')
  async getDeliveryMethods(@Request() req) {
    return this.fleetService.getDeliveryMethods(req.user.sub);
  }
}
