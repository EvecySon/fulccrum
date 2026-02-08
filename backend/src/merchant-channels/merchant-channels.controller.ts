import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { MerchantChannelsService } from './merchant-channels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('merchant')
@UseGuards(JwtAuthGuard)
export class MerchantChannelsController {
  constructor(private readonly channelsService: MerchantChannelsService) {}

  @Get('channels')
  async getChannels(@Request() req) {
    return this.channelsService.getChannels(req.user.sub);
  }

  @Patch('channels/:id')
  async updateChannel(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.channelsService.updateChannel(req.user.sub, id, data);
  }

  @Get('subscriptions')
  async getSubscriptions(@Request() req) {
    return this.channelsService.getSubscriptions(req.user.sub);
  }

  @Post('subscriptions')
  async createSubscription(@Request() req, @Body() data: any) {
    return this.channelsService.createSubscription(req.user.sub, data);
  }

  @Patch('subscriptions/:id')
  async updateSubscription(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.channelsService.updateSubscription(req.user.sub, id, data);
  }

  @Delete('subscriptions/:id')
  async deleteSubscription(@Request() req, @Param('id') id: string) {
    return this.channelsService.deleteSubscription(req.user.sub, id);
  }

  @Get('catering')
  async getCatering(@Request() req) {
    return this.channelsService.getCatering(req.user.sub);
  }

  @Post('catering')
  async createCateringOrder(@Request() req, @Body() data: any) {
    return this.channelsService.createCateringOrder(req.user.sub, data);
  }
}
