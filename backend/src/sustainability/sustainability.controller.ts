import { Controller, Get, Patch, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { SustainabilityService } from './sustainability.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sustainability')
@UseGuards(JwtAuthGuard)
export class SustainabilityController {
  constructor(private readonly sustainabilityService: SustainabilityService) {}

  @Get('carbon-footprint')
  async getCarbonFootprint(@Request() req) {
    return this.sustainabilityService.getCarbonFootprint(req.user.sub);
  }

  @Get('carbon-footprint/:orderId')
  async getOrderFootprint(@Request() req, @Param('orderId') orderId: string) {
    return this.sustainabilityService.getOrderFootprint(req.user.sub, orderId);
  }

  @Get('eco-options')
  async getEcoOptions(@Request() req) {
    return this.sustainabilityService.getEcoOptions(req.user.sub);
  }

  @Patch('eco-options')
  async updateEcoOptions(@Request() req, @Body() data: any) {
    return this.sustainabilityService.updateEcoOptions(req.user.sub, data);
  }

  @Get('waste-reduction')
  async getWasteReduction(@Request() req) {
    return this.sustainabilityService.getWasteReduction(req.user.sub);
  }

  @Post('carbon-offset')
  async purchaseOffset(@Request() req, @Body() body: { amount: number }) {
    return this.sustainabilityService.purchaseOffset(req.user.sub, body.amount);
  }
}
