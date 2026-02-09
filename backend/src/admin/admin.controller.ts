import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { InviteMerchantDto } from './dto/invite-merchant.dto';
import { InviteCourierDto } from './dto/invite-courier.dto';
import { ApproveCourierDto } from './dto/approve-courier.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
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

  // @Patch('merchants/:id/verify')
  // async verifyMerchant(@Param('id') id: string) {
  //   return this.adminService.verifyMerchant(id);
  // }

  @Post('invite/merchant')
  async inviteMerchant(@Body() dto: InviteMerchantDto) {
    return this.adminService.inviteMerchant(dto.email, dto.businessName, dto.ownerName, dto.phone, dto.commission);
  }

  // @Post('invite/courier')
  // async inviteCourier(@Body() dto: InviteCourierDto) {
  //   return this.adminService.inviteCourier(dto.email, dto.firstName, dto.lastName);
  // }

  // @Patch('couriers/:id/approve')
  // async approveCourier(@Param('id') id: string, @Body() dto: ApproveCourierDto) {
  //   return this.adminService.approveCourier(id, dto.approved, dto.notes);
  // }
}
