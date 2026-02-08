import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { MerchantInsightsService } from './merchant-insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('merchant/insights')
@UseGuards(JwtAuthGuard)
export class MerchantInsightsController {
  constructor(private readonly insightsService: MerchantInsightsService) {}

  @Get()
  async getAllInsights(@Request() req: any) {
    return this.insightsService.getAllInsights(req.user.sub);
  }

  @Get('demand-forecast')
  async getDemandForecast(@Request() req: any) {
    return this.insightsService.getDemandForecast(req.user.sub);
  }

  @Get('pricing')
  async getPricingOptimization(@Request() req: any) {
    return this.insightsService.getPricingOptimization(req.user.sub);
  }

  @Get('menu')
  async getMenuOptimization(@Request() req: any) {
    return this.insightsService.getMenuOptimization(req.user.sub);
  }

  @Post(':id/implement')
  async implementInsight(@Request() req: any, @Param('id') id: string) {
    return this.insightsService.implementInsight(req.user.sub, id);
  }

  @Post(':id/dismiss')
  async dismissInsight(@Request() req: any, @Param('id') id: string) {
    return this.insightsService.dismissInsight(req.user.sub, id);
  }
}
