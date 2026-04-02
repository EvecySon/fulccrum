import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Get('my-stats')
  async getMyStats(@Request() req: any) {
    return this.referralsService.getMyStats(req.user.sub);
  }

  @Get('history')
  async getHistory(@Request() req: any) {
    return this.referralsService.getHistory(req.user.sub);
  }
}
