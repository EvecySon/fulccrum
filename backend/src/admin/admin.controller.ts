import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { InviteMerchantDto } from './dto/invite-merchant.dto';
import { InviteCourierDto } from './dto/invite-courier.dto';
import { ApproveCourierDto } from './dto/approve-courier.dto';
import { SchedulingService } from '../courier/services/scheduling.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private schedulingService: SchedulingService,
  ) {}

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

  @Post('invite/courier')
  async inviteCourier(@Body() dto: InviteCourierDto) {
    return this.adminService.inviteCourier(dto.email, dto.firstName, dto.lastName);
  }

  @Patch('couriers/:id/approve')
  async approveCourier(@Param('id') id: string, @Body() dto: ApproveCourierDto) {
    return this.adminService.approveCourier(id, dto.approved, dto.notes);
  }

  @Get('couriers')
  async getAllCouriers(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllCouriers(
      req.user.role,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('couriers/pending')
  async getPendingCouriers(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getPendingCouriers(
      req.user.role,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Patch('couriers/:id/reject')
  async rejectCourier(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.approveCourier(id, false, reason);
  }

  @Patch('couriers/:id/suspend')
  async suspendCourier(@Request() req: any, @Param('id') id: string, @Body('reason') reason?: string) {
    return this.adminService.suspendUser(req.user.role, id);
  }

  @Patch('couriers/:id/reactivate')
  async reactivateCourier(@Request() req: any, @Param('id') id: string) {
    return this.adminService.activateUser(req.user.role, id);
  }

  @Get('merchants/:merchantId/application')
  async getMerchantApplication(@Request() req: any, @Param('merchantId') merchantId: string) {
    return this.adminService.getMerchantApplication(req.user.role, merchantId);
  }

  @Get('merchants/:merchantId/documents')
  async getMerchantDocuments(@Request() req: any, @Param('merchantId') merchantId: string) {
    return this.adminService.getMerchantDocuments(req.user.role, merchantId);
  }

  @Patch('merchants/:merchantId/documents/:docId/verify')
  async verifyMerchantDocument(@Request() req: any, @Param('merchantId') merchantId: string, @Param('docId') docId: string) {
    return this.adminService.verifyDocument(req.user.role, merchantId, docId);
  }

  @Patch('merchants/:merchantId/documents/:docId/reject')
  async rejectMerchantDocument(@Request() req: any, @Param('merchantId') merchantId: string, @Param('docId') docId: string, @Body('reason') reason: string) {
    return this.adminService.rejectDocument(req.user.role, merchantId, docId, reason);
  }

  @Post('merchants/:merchantId/request-documents')
  async requestMerchantDocuments(@Request() req: any, @Param('merchantId') merchantId: string, @Body('documentTypes') documentTypes: string[]) {
    return this.adminService.requestDocuments(req.user.role, merchantId, documentTypes);
  }

  @Get('couriers/:id/documents')
  async getCourierDocuments(@Request() req: any, @Param('id') id: string) {
    return this.adminService.getCourierDocuments(req.user.role, id);
  }

  @Patch('couriers/:id/documents/:docId/verify')
  async verifyCourierDocument(@Request() req: any, @Param('id') id: string, @Param('docId') docId: string) {
    return this.adminService.verifyDocument(req.user.role, id, docId);
  }

  // ─── Schedule Management ───
  @Get('schedule/slots')
  async getScheduleSlots(@Query('zone') zone?: string) {
    return this.schedulingService.getGlobalSlots(zone || 'default');
  }

  @Post('schedule/slots')
  async upsertScheduleSlot(@Body() data: any) {
    return this.schedulingService.upsertGlobalSlot(data);
  }

  @Delete('schedule/slots/:id')
  async deleteScheduleSlot(@Param('id') id: string) {
    return this.schedulingService.deleteGlobalSlot(id);
  }

  @Get('schedule/zones')
  async getScheduleZones() {
    return this.schedulingService.getZones();
  }

  @Post('schedule/zones')
  async upsertScheduleZone(@Body() data: any) {
    return this.schedulingService.upsertZone(data);
  }

  @Delete('schedule/zones/:id')
  async deleteScheduleZone(@Param('id') id: string) {
    return this.schedulingService.deleteZone(id);
  }

  @Get('schedule/stats')
  async getScheduleStats(
    @Query('zone') zone?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.schedulingService.getBookingStats(zone || 'default', startDate, endDate);
  }

  @Get('schedule/no-shows')
  async getNoShows(@Query('resolved') resolved?: string) {
    return this.schedulingService.getAllNoShows(resolved === 'true');
  }

  @Patch('schedule/no-shows/:id/resolve')
  async resolveNoShow(@Param('id') id: string) {
    return this.schedulingService.resolveNoShow(id);
  }

  @Post('schedule/no-shows/:courierId/:bookingId')
  async markNoShow(
    @Param('courierId') courierId: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.schedulingService.markNoShow(courierId, bookingId);
  }
}
