import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AnalyticsService } from '../services/analytics.service';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('custom-reports')
  async createCustomReport(@Request() req: any, @Body() data: any) {
    return this.analyticsService.createCustomReport({
      ...data,
      createdBy: req.user.sub,
    });
  }

  @Get('custom-reports')
  async getCustomReports(@Request() req: any) {
    return this.analyticsService.getCustomReports(req.user.sub);
  }

  @Post('custom-reports/:id/run')
  async runCustomReport(@Param('id') id: string) {
    return this.analyticsService.runCustomReport(id);
  }

  @Get('cohorts')
  async getCohortAnalysis(
    @Query('cohortType') cohortType: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getCohortAnalysis(
      cohortType,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('cohorts/generate')
  async generateCohortAnalysis(
    @Body() data: { cohortType: 'customer' | 'merchant' | 'courier'; startDate: string; endDate: string },
  ) {
    return this.analyticsService.generateCohortAnalysis(
      data.cohortType,
      new Date(data.startDate),
      new Date(data.endDate),
    );
  }

  @Get('funnels')
  async getFunnelAnalysis(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getFunnelAnalysis(new Date(startDate), new Date(endDate));
  }
}
