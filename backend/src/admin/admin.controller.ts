import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async getAllUsers(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllUsers(
      req.user.role,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Patch('users/:userId/suspend')
  async suspendUser(@Request() req: any, @Param('userId') userId: string) {
    return this.adminService.suspendUser(req.user.role, userId);
  }

  @Patch('users/:userId/activate')
  async activateUser(@Request() req: any, @Param('userId') userId: string) {
    return this.adminService.activateUser(req.user.role, userId);
  }

  @Get('orders')
  async getAllOrders(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllOrders(
      req.user.role,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('metrics')
  async getPlatformMetrics(@Request() req: any) {
    return this.adminService.getPlatformMetrics(req.user.role);
  }

  @Get('withdrawals/pending')
  async getPendingWithdrawals(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getPendingWithdrawals(
      req.user.role,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post('withdrawals/:withdrawalId/approve')
  async approveWithdrawal(@Request() req: any, @Param('withdrawalId') withdrawalId: string) {
    return this.adminService.approveWithdrawal(req.user.role, withdrawalId);
  }

  @Post('withdrawals/:withdrawalId/reject')
  async rejectWithdrawal(
    @Request() req: any,
    @Param('withdrawalId') withdrawalId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectWithdrawal(req.user.role, withdrawalId, reason);
  }

  @Get('activity')
  async getRecentActivity(@Request() req: any, @Query('limit') limit?: string) {
    return this.adminService.getRecentActivity(req.user.role, limit ? parseInt(limit) : 20);
  }

  @Get('merchants/pending')
  async getPendingMerchants(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getPendingMerchants(
      req.user.role,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Patch('merchants/:merchantId/approve')
  async approveMerchant(@Request() req: any, @Param('merchantId') merchantId: string) {
    return this.adminService.approveMerchant(req.user.role, merchantId);
  }

  @Patch('merchants/:merchantId/reject')
  async rejectMerchant(@Request() req: any, @Param('merchantId') merchantId: string) {
    return this.adminService.rejectMerchant(req.user.role, merchantId);
  }
}
