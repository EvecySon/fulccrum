import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('merchant')
  async getMerchantAnalytics(@Request() req: any, @Query('period') period?: string) {
    return this.analyticsService.getMerchantAnalytics(req.user.sub, period || 'today');
  }

  @Get('dashboard')
  async getDashboardStats(@Request() req: any) {
    return this.analyticsService.getDashboardStats(req.user.sub, req.user.role);
  }

  @Get('revenue')
  async getRevenueChart(@Request() req: any, @Query('days') days?: string) {
    return this.analyticsService.getRevenueChart(
      req.user.sub,
      days ? parseInt(days) : 30,
    );
  }

  @Get('top-performers')
  async getTopPerformers(
    @Query('type') type: 'drivers' | 'businesses',
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.getTopPerformers(type, limit ? parseInt(limit) : 10);
  }

  @Get('forecast/revenue')
  async getRevenueForecast(@Request() req: any, @Query('days') days?: string) {
    const businessId = req.user.role === 'business_owner' ? req.user.sub : undefined;
    return this.analyticsService.getRevenueForecast(businessId, days ? parseInt(days) : 30);
  }

  @Get('forecast/orders')
  async getOrderTrends(@Request() req: any, @Query('days') days?: string) {
    const businessId = req.user.role === 'business_owner' ? req.user.sub : undefined;
    return this.analyticsService.getOrderTrends(businessId, days ? parseInt(days) : 30);
  }

  @Get('insights/customers')
  async getCustomerInsights(@Request() req: any) {
    const businessId = req.user.role === 'business_owner' ? req.user.sub : undefined;
    return this.analyticsService.getCustomerInsights(businessId);
  }

  @Get('predictive')
  async getPredictiveAnalytics(@Request() req: any) {
    const businessId = req.user.role === 'business_owner' ? req.user.sub : undefined;
    return this.analyticsService.getPredictiveAnalytics(businessId);
  }
}
