import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FeesService } from './fees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CalculateFeesDto } from './dto/calculate-fees.dto';
import { UpdatePackagePricingDto } from './dto/update-package-pricing.dto';

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

  // Package Delivery Pricing Endpoints
  @Get('package-delivery/settings')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getPackageDeliverySettings() {
    return this.feesService.getPackageDeliverySettings();
  }

  @Put('package-delivery/settings')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updatePackageDeliverySettings(@Body() dto: UpdatePackagePricingDto) {
    return this.feesService.updatePackageDeliverySettings(dto);
  }
}
