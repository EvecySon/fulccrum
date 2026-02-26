import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from './paystack.service';
import { WalletService } from '../wallet/wallet.service';
import { IdempotencyService } from '../common/services/idempotency.service';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private paystackSecretKey: string;
  private paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private paystackService: PaystackService,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService,
    private idempotencyService: IdempotencyService,
  ) {
    this.paystackSecretKey = this.config.get('PAYSTACK_SECRET_KEY') || 'sk_test_xxx';
  }

  async initializePayment(userId: string, orderId: string, amount: number, idempotencyKey?: string) {
    // Generate idempotency key if not provided
    const key = idempotencyKey || this.idempotencyService.generateKey('payment', userId, orderId);

    // Execute with idempotency protection
    const result = await this.idempotencyService.execute(key, async () => {
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

      // Check if order already has a payment
      if (order.paymentId && order.paymentStatus === 'paid') {
        throw new BadRequestException('Order already paid');
      }

      // Generate unique reference with timestamp and random component
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const reference = `ORD-${order.orderNumber}-${timestamp}-${random}`;

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
              idempotencyKey: key,
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
          idempotencyKey: key,
        };
      } catch (error) {
        console.error('[PAYSTACK] Initialize error:', error.response?.data || error.message);
        throw new BadRequestException('Failed to initialize payment');
      }
    });

    return result.data;
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
        
        // Get order details with business info
        const order = await this.prisma.order.findUnique({
          where: { id: orderId },
          include: {
            business: true,
          },
        });

        if (!order) {
          throw new BadRequestException('Order not found');
        }

        // Update order payment status
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'paid',
            paymentMethod: data.channel,
          },
        });

        // Calculate platform fee (2% of total)
        const totalAmount = Number(order.totalAmount);
        const platformFeePercentage = 2; // 2% platform fee
        const platformFee = (totalAmount * platformFeePercentage) / 100;
        
        // Merchant gets: subtotal - platform fee
        const merchantEarnings = Number(order.subtotal) - platformFee;

        // Credit merchant wallet immediately
        await this.walletService.creditWallet(
          order.businessId,
          merchantEarnings,
          'order_payment',
          `Payment for order #${order.orderNumber}`,
        );

        console.log(`[PAYMENT] Order #${order.orderNumber} paid via ${data.channel}`);
        console.log(`[PAYMENT] Merchant wallet credited: ₦${merchantEarnings.toFixed(2)}`);
        console.log(`[PAYMENT] Platform fee: ₦${platformFee.toFixed(2)}`);
        console.log(`[PAYMENT] Driver will be credited ₦${order.deliveryFee} on delivery`);

        return {
          success: true,
          amount: data.amount / 100,
          reference: data.reference,
          paidAt: data.paid_at,
          channel: data.channel,
          merchantEarnings,
          platformFee,
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

    return { message: 'Webhook processed' };
  }

  async saveCard(
    userId: string,
    authorizationCode: string,
    cardType: string,
    last4: string,
    expMonth: string,
    expYear: string,
    bank: string,
  ) {
    const existing = await this.prisma.savedCard.findFirst({
      where: {
        userId,
        authorizationCode,
      },
    });

    if (existing) {
      throw new BadRequestException('Card already saved');
    }

    const isFirst = (await this.prisma.savedCard.count({ where: { userId } })) === 0;

    return this.prisma.savedCard.create({
      data: {
        userId,
        authorizationCode,
        cardType,
        last4,
        expMonth,
        expYear,
        bank,
        isDefault: isFirst,
      },
    });
  }

  async getSavedCards(userId: string) {
    return this.prisma.savedCard.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        cardType: true,
        last4: true,
        expMonth: true,
        expYear: true,
        bank: true,
        isDefault: true,
        createdAt: true,
      },
    });
  }

  async setDefaultCard(userId: string, cardId: string) {
    const card = await this.prisma.savedCard.findUnique({
      where: { id: cardId },
    });

    if (!card || card.userId !== userId) {
      throw new NotFoundException('Card not found');
    }

    await this.prisma.savedCard.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return this.prisma.savedCard.update({
      where: { id: cardId },
      data: { isDefault: true },
    });
  }

  async deleteCard(userId: string, cardId: string) {
    const card = await this.prisma.savedCard.findUnique({
      where: { id: cardId },
    });

    if (!card || card.userId !== userId) {
      throw new NotFoundException('Card not found');
    }

    await this.prisma.savedCard.update({
      where: { id: cardId },
      data: { isActive: false },
    });

    if (card.isDefault) {
      const firstCard = await this.prisma.savedCard.findFirst({
        where: { userId, isActive: true },
      });

      if (firstCard) {
        await this.prisma.savedCard.update({
          where: { id: firstCard.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true, message: 'Card removed' };
  }

  async initializeTopUp(userId: string, amount: number) {
    if (amount < 100) {
      throw new BadRequestException('Minimum top-up amount is ₦100');
    }
    if (amount > 500000) {
      throw new BadRequestException('Maximum top-up amount is ₦500,000');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const reference = `TOPUP-${Date.now()}-${userId.substring(0, 8)}`;

    const result = await this.paystackService.initializePayment({
      email: user.email,
      amount: Math.round(amount * 100), // kobo
      metadata: { type: 'wallet_topup', userId },
      callback_url: this.config.get('PAYSTACK_CALLBACK_URL') || 'https://fulccrum.com/payment/callback',
    });

    return {
      authorizationUrl: result.authorization_url,
      accessCode: result.access_code,
      reference: result.reference,
    };
  }

  async verifyTopUp(userId: string, reference: string) {
    const result = await this.paystackService.verifyPayment(reference);

    if (result.status !== 'success') {
      return { success: false, message: 'Payment not successful' };
    }

    const metadata = result.metadata || {};
    if (metadata.type !== 'wallet_topup' && metadata.type !== 'card_add') {
      throw new BadRequestException('Invalid payment reference for top-up');
    }

    const amount = result.amount / 100; // kobo to naira

    // Credit wallet
    let wallet = await this.prisma.digitalWallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.digitalWallet.create({ data: { userId } });
    }
    await this.prisma.digitalWallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });

    // Auto-save card if authorization exists
    const auth = result.authorization;
    if (auth?.authorization_code && auth?.last4) {
      const existing = await this.prisma.savedCard.findFirst({
        where: { userId, authorizationCode: auth.authorization_code },
      });
      if (!existing) {
        const isFirst = (await this.prisma.savedCard.count({ where: { userId } })) === 0;
        await this.prisma.savedCard.create({
          data: {
            userId,
            authorizationCode: auth.authorization_code,
            cardType: auth.card_type || 'unknown',
            last4: auth.last4,
            expMonth: auth.exp_month || '00',
            expYear: auth.exp_year || '00',
            bank: auth.bank || 'Unknown',
            isDefault: isFirst,
          },
        });
      }
    }

    return {
      success: true,
      amount,
      newBalance: Number(wallet.balance) + amount,
      message: `₦${amount.toLocaleString()} added to wallet`,
      cardSaved: !!auth?.authorization_code,
    };
  }

  async initializeCardAdd(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Charge ₦50 to tokenize the card, then refund or credit to wallet
    const result = await this.paystackService.initializePayment({
      email: user.email,
      amount: 5000, // ₦50 in kobo
      metadata: { type: 'card_add', userId },
      callback_url: this.config.get('PAYSTACK_CALLBACK_URL') || 'https://fulccrum.com/payment/callback',
    });

    return {
      authorizationUrl: result.authorization_url,
      accessCode: result.access_code,
      reference: result.reference,
    };
  }

  async chargeCard(userId: string, cardId: string, amount: number, email: string) {
    const card = await this.prisma.savedCard.findUnique({
      where: { id: cardId },
    });

    if (!card || card.userId !== userId || !card.isActive) {
      throw new NotFoundException('Card not found');
    }

    const charge = await axios.post(
      `${this.paystackBaseUrl}/charge`,
      {
        email,
        amount: amount * 100,
        authorization_code: card.authorizationCode,
      },
      {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      success: true,
      reference: charge.data.reference,
      amount: charge.data.amount / 100,
    };
  }
}
