import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  async createNotification(@Request() req: any, @Body() dto: CreateNotificationDto) {
    return this.notificationsService.createNotification(req.user.sub, dto);
  }

  @Get()
  async getNotifications(
    @Request() req: any,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getUserNotifications(
      req.user.sub,
      unreadOnly === 'true',
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.deleteNotification(id, req.user.sub);
  }

  @Post('devices/register')
  async registerDevice(@Request() req: any, @Body() dto: RegisterDeviceDto) {
    return this.notificationsService.registerDeviceToken(
      req.user.sub,
      dto.token,
      dto.platform,
      dto.deviceId,
    );
  }

  @Get('devices')
  async getDevices(@Request() req: any) {
    return this.notificationsService.getUserDevices(req.user.sub);
  }

  @Delete('devices/:deviceId')
  async removeDevice(@Param('deviceId') deviceId: string, @Request() req: any) {
    return this.notificationsService.removeDevice(req.user.sub, deviceId);
  }

  @Post('test/push')
  async testPushNotification(@Request() req: any, @Body() body: { title: string; message: string }) {
    return this.notificationsService.sendPushNotification(
      req.user.sub,
      body.title,
      body.message,
    );
  }

  @Post('test/email')
  async testEmail(@Request() req: any, @Body() body: { subject: string; message: string }) {
    return this.notificationsService.sendEmail(req.user.sub, body.subject, body.message);
  }

  @Post('test/sms')
  async testSMS(@Request() req: any, @Body() body: { message: string }) {
    return this.notificationsService.sendSMS(req.user.sub, body.message);
  }
}
