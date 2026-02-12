import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CommissionService } from '../services/commission.service';
import { FinanceService } from '../services/finance.service';
import { RefundService } from '../services/refund.service';
import { AuditService } from '../services/audit.service';

@Controller('admin/finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class FinanceController {
  constructor(
    private commissionService: CommissionService,
    private financeService: FinanceService,
    private refundService: RefundService,
    private auditService: AuditService,
  ) {}

  // Commission Tiers
  @Post('commissions/tiers')
  async createTier(@Request() req: any, @Body() data: any) {
    const tier = await this.commissionService.createTier(data);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'created_commission_tier',
      resource: 'commission_tier',
      resourceId: tier.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return tier;
  }

  @Get('commissions/tiers')
  async getTiers(@Query('businessType') businessType?: string, @Query('isActive') isActive?: string) {
    return this.commissionService.getTiers(businessType, isActive === 'true');
  }

  @Patch('commissions/tiers/:id')
  async updateTier(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    const tier = await this.commissionService.updateTier(id, data);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'updated_commission_tier',
      resource: 'commission_tier',
      resourceId: id,
      changes: data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return tier;
  }

  // Commission Assignment
  @Post('commissions/assign')
  async assignCommission(@Request() req: any, @Body() data: any) {
    const assignment = await this.commissionService.assignCommission(data);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'assigned_commission',
      resource: 'merchant_commission',
      resourceId: assignment.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return assignment;
  }

  @Get('commissions/merchant/:businessId')
  async getMerchantCommissions(@Param('businessId') businessId: string) {
    return this.commissionService.getMerchantCommissions(businessId);
  }

  // Revenue Analytics
  @Get('revenue/analytics')
  async getRevenueAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    return this.financeService.getRevenueAnalytics(
      new Date(startDate),
      new Date(endDate),
      groupBy,
    );
  }

  @Get('revenue/forecast')
  async getRevenueForecast(@Query('days') days?: string) {
    return this.financeService.getRevenueForecast(days ? parseInt(days) : 30);
  }

  @Get('revenue/settlements')
  async getMerchantSettlements(
    @Query('businessId') businessId?: string,
    @Query('status') status?: 'pending' | 'completed',
  ) {
    return this.financeService.getMerchantSettlements(businessId, status);
  }

  @Post('revenue/reconcile/:orderId')
  async reconcileOrder(@Request() req: any, @Param('orderId') orderId: string) {
    const result = await this.financeService.reconcileOrder(orderId);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'reconciled_order',
      resource: 'platform_revenue',
      resourceId: result.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  // Refunds
  @Post('refunds')
  async createRefund(@Request() req: any, @Body() data: any) {
    return this.refundService.createRefund({
      ...data,
      requestedBy: req.user.sub,
    });
  }

  @Get('refunds')
  async getRefunds(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.refundService.getRefunds(
      status,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Patch('refunds/:id/approve')
  async approveRefund(@Request() req: any, @Param('id') id: string) {
    const refund = await this.refundService.approveRefund(id, req.user.sub);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'approved_refund',
      resource: 'refund',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return refund;
  }

  @Patch('refunds/:id/reject')
  async rejectRefund(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    const refund = await this.refundService.rejectRefund(id, req.user.sub, reason);
    await this.auditService.log({
      adminUserId: req.user.adminUser.id,
      action: 'rejected_refund',
      resource: 'refund',
      resourceId: id,
      changes: { reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return refund;
  }

  @Get('refunds/stats')
  async getRefundStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.refundService.getRefundStats(new Date(startDate), new Date(endDate));
  }

  // Reports
  @Get('reports/export')
  async exportFinancialReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format?: 'csv' | 'json',
  ) {
    return this.financeService.exportFinancialReport(
      new Date(startDate),
      new Date(endDate),
      format || 'json',
    );
  }
}
