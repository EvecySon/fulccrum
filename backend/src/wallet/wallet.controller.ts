import { Controller, Get, Post, Body, Query, UseGuards, Request, Ip } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { ConfirmWithdrawalDto } from './dto/confirm-withdrawal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req: any) {
    return this.walletService.getBalance(req.user.sub);
  }

  @Post('withdraw/request')
  async requestWithdrawal(
    @Request() req: any,
    @Body() dto: RequestWithdrawalDto,
    @Ip() ip: string,
  ) {
    return this.walletService.requestWithdrawal(req.user.sub, dto.amount, ip);
  }

  @Post('withdraw/confirm')
  async confirmWithdrawal(@Request() req: any, @Body() dto: ConfirmWithdrawalDto) {
    return this.walletService.confirmWithdrawal(req.user.sub, dto.requestId, dto.confirmationCode);
  }

  @Get('withdraw/history')
  async getWithdrawalHistory(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getWithdrawalHistory(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post('withdraw/cancel')
  async cancelWithdrawal(@Request() req: any, @Body('requestId') requestId: string) {
    return this.walletService.cancelWithdrawalRequest(req.user.sub, requestId);
  }
}
