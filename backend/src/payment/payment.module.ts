import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaystackService } from './paystack.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), forwardRef(() => WalletModule)],
  controllers: [PaymentController],
  providers: [PaymentService, PaystackService],
  exports: [PaymentService, PaystackService],
})
export class PaymentModule {}
