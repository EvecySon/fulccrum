import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('recommendations')
  async getRecommendations(@Request() req, @Query('limit') limit = 10) {
    return this.aiService.getRecommendations(req.user.sub, +limit);
  }

  @Get('predictive-orders')
  async getPredictiveOrders(@Request() req) {
    return this.aiService.getPredictiveOrders(req.user.sub);
  }

  @Get('voice-profile')
  async getVoiceProfile(@Request() req) {
    return this.aiService.getVoiceProfile(req.user.sub);
  }

  @Post('voice-command')
  async processVoiceCommand(@Request() req, @Body() body: { audioUri: string }) {
    return this.aiService.processVoiceCommand(req.user.sub, body.audioUri);
  }

  @Get('behavior-analysis')
  async getBehaviorAnalysis(@Request() req) {
    return this.aiService.getBehaviorAnalysis(req.user.sub);
  }

  @Post('recommendations/:id/dismiss')
  async dismissRecommendation(@Request() req, @Param('id') id: string) {
    return this.aiService.dismissRecommendation(req.user.sub, id);
  }

  @Post('recommendations/:id/accept')
  async acceptRecommendation(@Request() req, @Param('id') id: string) {
    return this.aiService.acceptRecommendation(req.user.sub, id);
  }
}
