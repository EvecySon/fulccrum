import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaystackService } from './paystack.service';
import { PaystackMockService } from './paystack-mock.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), forwardRef(() => WalletModule)],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: PaystackService,
      useFactory: (config: ConfigService) => {
        const secretKey = config.get('PAYSTACK_SECRET_KEY');
        // Use mock if no real key or placeholder key
        if (!secretKey || secretKey.includes('your_paystack_secret_key_here')) {
          console.log('[PAYMENT MODULE] Using MOCK Paystack service (no real API keys)');
          return new PaystackMockService();
        }
        console.log('[PAYMENT MODULE] Using REAL Paystack service');
        return new PaystackService(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [PaymentService, PaystackService],
})
export class PaymentModule {}
