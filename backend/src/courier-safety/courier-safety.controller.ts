import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CourierSafetyService } from './courier-safety.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('courier')
@UseGuards(JwtAuthGuard)
export class CourierSafetyController {
  constructor(private readonly safetyService: CourierSafetyService) {}

  @Post('safety/emergency')
  async reportEmergency(@Request() req: any, @Body() data: any) {
    return this.safetyService.reportEmergency(req.user.sub, data);
  }

  @Get('support')
  async getSupport(@Request() req: any) {
    return this.safetyService.getSupport(req.user.sub);
  }

  @Post('support')
  async submitSupportQuery(@Request() req: any, @Body() body: { query: string }) {
    return this.safetyService.submitSupportQuery(req.user.sub, body.query);
  }

  @Post('safety/location-share')
  async shareLocation(@Request() req: any, @Body() data: any) {
    return this.safetyService.shareLocation(req.user.sub, data);
  }

  @Get('safety/events')
  async getSafetyEvents(@Request() req: any) {
    return this.safetyService.getSafetyEvents(req.user.sub);
  }
}
