import {
  Controller,
  Post,
  Delete,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { RegisterTokenDto, UpdateSettingsDto } from './push-notification.service';
import { PushNotificationService } from './push-notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class PushNotificationController {
  constructor(private pushNotificationService: PushNotificationService) {}

  @Post('register-token')
  async registerToken(
    @CurrentUser() user: any,
    @Body() dto: RegisterTokenDto,
  ) {
    return this.pushNotificationService.registerPushToken(user.id, dto);
  }

  @Delete('remove-token')
  async removeToken(@Body() body: { token: string }) {
    return this.pushNotificationService.removePushToken(body.token);
  }

  @Get('tokens')
  async getTokens(@CurrentUser() user: any) {
    return this.pushNotificationService.getUserPushTokens(user.id);
  }

  @Get('settings')
  async getSettings(@CurrentUser() user: any) {
    return this.pushNotificationService.getNotificationSettings(user.id);
  }

  @Put('settings')
  async updateSettings(
    @CurrentUser() user: any,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.pushNotificationService.updateNotificationSettings(user.id, dto);
  }
}
