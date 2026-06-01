import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, Delete, Patch, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { SaveCardDto } from './dto/save-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NonceGuard } from '../common/guards/nonce.guard';
import { RequireNonce } from '../common/decorators/require-nonce.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('initialize')
  @UseGuards(JwtAuthGuard, NonceGuard)
  @RequireNonce('payment')
  async initializePayment(
    @Request() req: any,
    @Body() dto: InitializePaymentDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.paymentService.initializePayment(req.user.sub, dto.orderId, dto.amount, idempotencyKey);
  }

  @Get('verify/:reference')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(@Param('reference') reference: string) {
    return this.paymentService.verifyPayment(reference);
  }

  @Post('refund/:orderId')
  @UseGuards(JwtAuthGuard)
  async refundPayment(
    @Param('orderId') orderId: string,
    @Body('amount') amount?: number,
  ) {
    return this.paymentService.processRefund(orderId, amount);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getPaymentHistory(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentService.getPaymentHistory(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post('cards')
  @UseGuards(JwtAuthGuard, NonceGuard)
  @RequireNonce('card-save')
  async saveCard(@Request() req: any, @Body() dto: SaveCardDto) {
    return this.paymentService.saveCard(
      req.user.sub,
      dto.authorizationCode,
      dto.cardType,
      dto.last4,
      dto.expMonth,
      dto.expYear,
      dto.bank,
    );
  }

  @Get('cards')
  @UseGuards(JwtAuthGuard)
  async getSavedCards(@Request() req: any) {
    return this.paymentService.getSavedCards(req.user.sub);
  }

  @Patch('cards/:id/set-default')
  @UseGuards(JwtAuthGuard)
  async setDefaultCard(@Request() req: any, @Param('id') id: string) {
    return this.paymentService.setDefaultCard(req.user.sub, id);
  }

  @Delete('cards/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCard(@Request() req: any, @Param('id') id: string) {
    return this.paymentService.deleteCard(req.user.sub, id);
  }

  @Post('topup')
  @UseGuards(JwtAuthGuard, NonceGuard)
  @RequireNonce('payment')
  async initializeTopUp(@Request() req: any, @Body('amount') amount: number) {
    return this.paymentService.initializeTopUp(req.user.sub, amount);
  }

  @Get('topup/verify/:reference')
  @UseGuards(JwtAuthGuard)
  async verifyTopUp(@Request() req: any, @Param('reference') reference: string) {
    return this.paymentService.verifyTopUp(req.user.sub, reference);
  }

  @Post('cards/add')
  @UseGuards(JwtAuthGuard)
  async initializeCardAdd(@Request() req: any) {
    return this.paymentService.initializeCardAdd(req.user.sub);
  }

  @Get('virtual-account')
  @UseGuards(JwtAuthGuard)
  async getVirtualAccount(@Request() req: any) {
    return this.paymentService.getOrCreateVirtualAccount(req.user.sub);
  }

  @Post('webhook')
  async handleWebhook(@Request() req: any, @Body() payload: any) {
    const signature = req.headers['x-paystack-signature'];
    return this.paymentService.handlePaystackWebhook(payload, signature);
  }

  @Post('ussd/generate')
  @UseGuards(JwtAuthGuard)
  async generateUSSDCode(
    @Request() req: any,
    @Body('amount') amount: number,
    @Body('bankCode') bankCode: string,
  ) {
    return this.paymentService.generateUSSDCode(req.user.sub, amount, bankCode);
  }

  @Get('status/:reference')
  @UseGuards(JwtAuthGuard)
  async checkPaymentStatus(@Param('reference') reference: string) {
    return this.paymentService.checkPaymentStatus(reference);
  }
}
