import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { MerchantInsightsService } from './merchant-insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('merchant/insights')
@UseGuards(JwtAuthGuard)
export class MerchantInsightsController {
  constructor(private readonly insightsService: MerchantInsightsService) {}

  @Get()
  async getAllInsights(@Request() req) {
    return this.insightsService.getAllInsights(req.user.sub);
  }

  @Get('demand-forecast')
  async getDemandForecast(@Request() req) {
    return this.insightsService.getDemandForecast(req.user.sub);
  }

  @Get('pricing')
  async getPricingOptimization(@Request() req) {
    return this.insightsService.getPricingOptimization(req.user.sub);
  }

  @Get('menu')
  async getMenuOptimization(@Request() req) {
    return this.insightsService.getMenuOptimization(req.user.sub);
  }

  @Post(':id/implement')
  async implementInsight(@Request() req, @Param('id') id: string) {
    return this.insightsService.implementInsight(req.user.sub, id);
  }

  @Post(':id/dismiss')
  async dismissInsight(@Request() req, @Param('id') id: string) {
    return this.insightsService.dismissInsight(req.user.sub, id);
  }
}
