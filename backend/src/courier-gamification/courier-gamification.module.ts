import { Module } from '@nestjs/common';
import { CourierGamificationService } from './courier-gamification.service';
import { CourierGamificationController } from './courier-gamification.controller';

@Module({
  controllers: [CourierGamificationController],
  providers: [CourierGamificationService],
})
export class CourierGamificationModule {}
