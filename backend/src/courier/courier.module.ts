import { Module } from '@nestjs/common';
import { CourierController } from './courier.controller';
import { QuestService } from './services/quest.service';
import { SurgeService } from './services/surge.service';
import { PreferencesService } from './services/preferences.service';
import { SchedulingService } from './services/scheduling.service';
import { MaintenanceService } from './services/maintenance.service';
import { ReferralService } from './services/referral.service';
import { InsuranceService } from './services/insurance.service';
import { TrainingService } from './services/training.service';
import { OrderService } from './services/order.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [CourierController],
  providers: [
    QuestService,
    SurgeService,
    PreferencesService,
    SchedulingService,
    MaintenanceService,
    ReferralService,
    InsuranceService,
    TrainingService,
    OrderService,
  ],
  exports: [
    QuestService,
    SurgeService,
    PreferencesService,
    SchedulingService,
    MaintenanceService,
    ReferralService,
    InsuranceService,
    TrainingService,
    OrderService,
  ],
})
export class CourierModule {}
