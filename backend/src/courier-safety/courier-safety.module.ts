import { Module } from '@nestjs/common';
import { CourierSafetyService } from './courier-safety.service';
import { CourierSafetyController } from './courier-safety.controller';

@Module({
  controllers: [CourierSafetyController],
  providers: [CourierSafetyService],
})
export class CourierSafetyModule {}
