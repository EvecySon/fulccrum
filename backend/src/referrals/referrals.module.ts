import { Module } from '@nestjs/common';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { ReferralTrackingService } from './referral-tracking.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReferralsController],
  providers: [ReferralsService, ReferralTrackingService],
  exports: [ReferralsService, ReferralTrackingService],
})
export class ReferralsModule {}
