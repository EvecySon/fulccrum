import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CourierGamificationService } from './courier-gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('courier')
@UseGuards(JwtAuthGuard)
export class CourierGamificationController {
  constructor(private readonly gamificationService: CourierGamificationService) {}

  @Get('achievements')
  async getAchievements(@Request() req) {
    return this.gamificationService.getAchievements(req.user.sub);
  }

  @Get('tiers')
  async getTiers(@Request() req) {
    return this.gamificationService.getTiers(req.user.sub);
  }

  @Get('leaderboard')
  async getLeaderboard(@Request() req, @Query('period') period?: string) {
    return this.gamificationService.getLeaderboard(req.user.sub, period);
  }

  @Post('achievements/:achievementId/claim')
  async claimReward(@Request() req, @Param('achievementId') achievementId: string) {
    return this.gamificationService.claimReward(req.user.sub, achievementId);
  }
}
