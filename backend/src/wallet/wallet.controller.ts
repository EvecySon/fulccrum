import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards, Request, Ip } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { ConfirmWithdrawalDto } from './dto/confirm-withdrawal.dto';
import { AddBankAccountDto } from './dto/add-bank-account.dto';
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

  @Post('bank-accounts')
  async addBankAccount(@Request() req: any, @Body() dto: AddBankAccountDto) {
    return this.walletService.addBankAccount(
      req.user.sub,
      dto.accountName,
      dto.accountNumber,
      dto.bankCode,
      dto.bankName,
    );
  }

  @Get('bank-accounts')
  async getBankAccounts(@Request() req: any) {
    return this.walletService.getBankAccounts(req.user.sub);
  }

  @Patch('bank-accounts/:id/set-default')
  async setDefaultBankAccount(@Request() req: any, @Param('id') id: string) {
    return this.walletService.setDefaultBankAccount(req.user.sub, id);
  }

  @Delete('bank-accounts/:id')
  async deleteBankAccount(@Request() req: any, @Param('id') id: string) {
    return this.walletService.deleteBankAccount(req.user.sub, id);
  }
}
