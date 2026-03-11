import { Module } from '@nestjs/common';
import { GadgetsController } from './gadgets.controller';
import { GadgetsService } from './gadgets.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GadgetsController],
  providers: [GadgetsService],
  exports: [GadgetsService],
})
export class GadgetsModule {}
