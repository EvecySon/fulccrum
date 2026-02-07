import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FeesService } from './fees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CalculateFeesDto } from './dto/calculate-fees.dto';

@Controller('fees')
@UseGuards(JwtAuthGuard)
export class FeesController {
  constructor(private feesService: FeesService) {}

  @Get('settings')
  async getSettings() {
    return this.feesService.getSettings();
  }

  @Post('settings')
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.feesService.updateSettings(dto);
  }

  @Post('calculate')
  async calculateFees(@Body() dto: CalculateFeesDto) {
    return this.feesService.previewOrderFees(
      dto.businessId,
      dto.customerAddressId,
      dto.subtotal,
      dto.promoCode,
    );
  }
}
