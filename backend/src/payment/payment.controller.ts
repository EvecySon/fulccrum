import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
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
}
