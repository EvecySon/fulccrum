import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('loyalty')
@UseGuards(JwtAuthGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.loyaltyService.getProfile(req.user.sub);
  }

  @Get('history')
  async getHistory(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.loyaltyService.getHistory(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('rewards')
  async getRewards() {
    return this.loyaltyService.getRewards();
  }

  @Post('redeem/:rewardId')
  async redeemReward(@Request() req: any, @Param('rewardId') rewardId: string) {
    return this.loyaltyService.redeemReward(req.user.sub, rewardId);
  }
}
