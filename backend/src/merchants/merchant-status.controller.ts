import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MerchantStatusService } from './merchant-status.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('merchant/store')
@UseGuards(JwtAuthGuard)
export class MerchantStatusController {
  constructor(private merchantStatusService: MerchantStatusService) {}

  @Get('status')
  async getStatus(@CurrentUser() user: any) {
    return this.merchantStatusService.getStoreStatus(user.id);
  }

  @Put('status')
  async updateStatus(
    @CurrentUser() user: any,
    @Body() body: {
      status: 'auto' | 'force_open' | 'force_closed' | 'paused';
      pauseMinutes?: number;
      reason?: string;
    },
  ) {
    return this.merchantStatusService.setManualStatus(
      user.id,
      body.status,
      body.pauseMinutes,
      body.reason,
    );
  }

  @Put('heartbeat')
  async heartbeat(@CurrentUser() user: any) {
    await this.merchantStatusService.updateLastSeen(user.id);
    return { success: true };
  }
}

@Controller('stores/:id')
export class StoreStatusController {
  constructor(private merchantStatusService: MerchantStatusService) {}

  @Get('status')
  async getStoreStatus(@Param('id') merchantId: string) {
    return this.merchantStatusService.getStoreStatus(merchantId);
  }
}
