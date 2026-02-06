import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private paystackSecretKey: string;
  private paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.paystackSecretKey = this.config.get('PAYSTACK_SECRET_KEY') || 'sk_test_xxx';
  }

  async initializePayment(userId: string, orderId: string, amount: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.customerId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    const reference = `ORD-${order.orderNumber}-${Date.now()}`;

    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email: order.customer.email,
          amount: Math.round(amount * 100), // Convert to kobo
          currency: 'NGN',
          reference,
          callback_url: this.config.get('PAYSTACK_CALLBACK_URL') || 'https://your-domain.com/payment/callback',
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentId: reference,
          paymentStatus: 'pending',
        },
      });

      return {
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: response.data.data.reference,
      };
    } catch (error) {
      console.error('[PAYSTACK] Initialize error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to initialize payment');
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );

      const { data } = response.data;

      if (data.status === 'success') {
        const orderId = data.metadata.orderId;
        
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'paid',
            paymentMethod: data.channel,
          },
        });

        return {
          success: true,
          amount: data.amount / 100,
          reference: data.reference,
          paidAt: data.paid_at,
          channel: data.channel,
        };
      }

      return { success: false };
    } catch (error) {
      console.error('[PAYSTACK] Verify error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to verify payment');
    }
  }

  async processRefund(orderId: string, amount?: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.paymentId) {
      throw new BadRequestException('Invalid order or payment');
    }

    const refundAmount = amount || Number(order.totalAmount);

    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/refund`,
        {
          transaction: order.paymentId,
          amount: Math.round(refundAmount * 100),
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: amount ? 'partially_refunded' : 'refunded',
          status: 'refunded',
        },
      });

      return {
        success: true,
        message: 'Refund processed successfully',
        data: response.data,
      };
    } catch (error) {
      console.error('[PAYSTACK] Refund error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to process refund');
    }
  }

  async getPaymentHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          customerId: userId,
          paymentStatus: { in: ['paid', 'refunded', 'partially_refunded'] },
        },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          paymentStatus: true,
          paymentMethod: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({
        where: {
          customerId: userId,
          paymentStatus: { in: ['paid', 'refunded', 'partially_refunded'] },
        },
      }),
    ]);

    return {
      data: payments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async handleWebhook(payload: any, signature: string) {
    // Verify webhook signature
    // const hash = crypto.createHmac('sha512', this.paystackSecretKey).update(JSON.stringify(payload)).digest('hex');
    // if (hash !== signature) {
    //   throw new BadRequestException('Invalid signature');
    // }

    const { event, data } = payload;

    if (event === 'charge.success') {
      await this.verifyPayment(data.reference);
    }

    return { received: true };
  }
}
