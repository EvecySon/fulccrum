import { Module } from '@nestjs/common';
import { BusinessHoursService } from './business-hours.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BusinessHoursService],
  exports: [BusinessHoursService],
})
export class BusinessModule {}
