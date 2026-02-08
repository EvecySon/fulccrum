import { Module } from '@nestjs/common';
import { CourierFleetService } from './courier-fleet.service';
import { CourierFleetController } from './courier-fleet.controller';

@Module({
  controllers: [CourierFleetController],
  providers: [CourierFleetService],
})
export class CourierFleetModule {}
