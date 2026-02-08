import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { MerchantPricingService } from './merchant-pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('merchant/pricing')
@UseGuards(JwtAuthGuard)
export class MerchantPricingController {
  constructor(private readonly pricingService: MerchantPricingService) {}

  @Get('rules')
  async getRules(@Request() req: any) {
    return this.pricingService.getRules(req.user.sub);
  }

  @Post('rules')
  async createRule(@Request() req: any, @Body() data: any) {
    return this.pricingService.createRule(req.user.sub, data);
  }

  @Patch('rules/:id')
  async updateRule(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.pricingService.updateRule(req.user.sub, id, data);
  }

  @Delete('rules/:id')
  async deleteRule(@Request() req: any, @Param('id') id: string) {
    return this.pricingService.deleteRule(req.user.sub, id);
  }

  @Patch('rules/:id/toggle')
  async toggleRule(@Request() req: any, @Param('id') id: string) {
    return this.pricingService.toggleRule(req.user.sub, id);
  }

  @Get('rules/:id/preview')
  async getPreview(@Request() req: any, @Param('id') id: string) {
    return this.pricingService.getPreview(req.user.sub, id);
  }
}
