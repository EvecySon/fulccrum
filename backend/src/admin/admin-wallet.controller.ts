import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AdminWalletService } from './admin-wallet.service';
import { CreditWalletDto, DebitWalletDto, ApproveWalletActionDto, RejectWalletActionDto } from './dto/credit-wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin', 'finance')
export class AdminWalletController {
  constructor(private adminWalletService: AdminWalletService) {}

  @Post('credit')
  async creditWallet(@Request() req: any, @Body() dto: CreditWalletDto) {
    const adminUserId = req.user.adminUserId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.adminWalletService.creditWallet(adminUserId, dto, ipAddress, userAgent);
  }

  @Post('debit')
  async debitWallet(@Request() req: any, @Body() dto: DebitWalletDto) {
    const adminUserId = req.user.adminUserId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.adminWalletService.debitWallet(adminUserId, dto, ipAddress, userAgent);
  }

  @Post('approve')
  @Roles('super_admin', 'finance')
  async approvePendingAction(@Request() req: any, @Body() dto: ApproveWalletActionDto) {
    const approverId = req.user.adminUserId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.adminWalletService.approvePendingAction(
      approverId,
      dto.actionId,
      dto.notes || '',
      ipAddress,
      userAgent,
    );
  }

  @Post('reject')
  @Roles('super_admin', 'finance')
  async rejectPendingAction(@Request() req: any, @Body() dto: RejectWalletActionDto) {
    const approverId = req.user.adminUserId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.adminWalletService.rejectPendingAction(
      approverId,
      dto.actionId,
      dto.reason,
      ipAddress,
      userAgent,
    );
  }

  @Get('pending-actions')
  @Roles('super_admin', 'finance')
  async getPendingActions(@Request() req: any) {
    const adminUserId = req.user.adminUserId;
    return this.adminWalletService.getPendingActions(adminUserId);
  }

  @Get('user/:userId')
  async getUserWallet(@Param('userId') userId: string) {
    return this.adminWalletService.getUserWallet(userId);
  }

  @Get('user/:userId/audit-log')
  async getWalletAuditLog(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminWalletService.getWalletAuditLog(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }
}
