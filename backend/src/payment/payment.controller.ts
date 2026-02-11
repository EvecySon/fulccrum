import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, Delete, Patch } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { SaveCardDto } from './dto/save-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('initialize')
  async initializePayment(@Request() req: any, @Body() dto: InitializePaymentDto) {
    return this.paymentService.initializePayment(req.user.sub, dto.orderId, dto.amount);
  }

  @Get('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    return this.paymentService.verifyPayment(reference);
  }

  @Post('refund/:orderId')
  async refundPayment(
    @Param('orderId') orderId: string,
    @Body('amount') amount?: number,
  ) {
    return this.paymentService.processRefund(orderId, amount);
  }

  @Get('history')
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

  @Post('webhook')
  async handleWebhook(@Body() payload: any, @Request() req: any) {
    const signature = req.headers['x-paystack-signature'];
    return this.paymentService.handleWebhook(payload, signature);
  }

  @Post('cards')
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
  async getSavedCards(@Request() req: any) {
    return this.paymentService.getSavedCards(req.user.sub);
  }

  @Patch('cards/:id/set-default')
  async setDefaultCard(@Request() req: any, @Param('id') id: string) {
    return this.paymentService.setDefaultCard(req.user.sub, id);
  }

  @Delete('cards/:id')
  async deleteCard(@Request() req: any, @Param('id') id: string) {
    return this.paymentService.deleteCard(req.user.sub, id);
  }

  @Post('topup')
  async initializeTopUp(@Request() req: any, @Body('amount') amount: number) {
    return this.paymentService.initializeTopUp(req.user.sub, amount);
  }

  @Get('topup/verify/:reference')
  async verifyTopUp(@Request() req: any, @Param('reference') reference: string) {
    return this.paymentService.verifyTopUp(req.user.sub, reference);
  }

  @Post('cards/add')
  async initializeCardAdd(@Request() req: any) {
    return this.paymentService.initializeCardAdd(req.user.sub);
  }
}
