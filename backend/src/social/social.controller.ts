import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('connections')
  async getConnections(@Request() req) {
    return this.socialService.getConnections(req.user.sub);
  }

  @Post('connections')
  async addConnection(@Request() req, @Body() body: { userId: string; type: string }) {
    return this.socialService.addConnection(req.user.sub, body.userId, body.type);
  }

  @Delete('connections/:connectionId')
  async removeConnection(@Request() req, @Param('connectionId') connectionId: string) {
    return this.socialService.removeConnection(req.user.sub, connectionId);
  }

  @Get('posts')
  async getFeed(@Request() req, @Query('page') page = 1) {
    return this.socialService.getFeed(req.user.sub, +page);
  }

  @Post('posts')
  async createPost(@Request() req, @Body() body: any) {
    return this.socialService.createPost(req.user.sub, body);
  }

  @Post('posts/:postId/like')
  async likePost(@Request() req, @Param('postId') postId: string) {
    return this.socialService.likePost(req.user.sub, postId);
  }

  @Post('posts/:postId/comment')
  async commentPost(@Request() req, @Param('postId') postId: string, @Body() body: { text: string }) {
    return this.socialService.commentPost(req.user.sub, postId, body.text);
  }

  @Get('challenges')
  async getChallenges(@Request() req) {
    return this.socialService.getChallenges(req.user.sub);
  }

  @Post('challenges/:challengeId/join')
  async joinChallenge(@Request() req, @Param('challengeId') challengeId: string) {
    return this.socialService.joinChallenge(req.user.sub, challengeId);
  }

  @Get('group-orders')
  async getGroupOrders(@Request() req) {
    return this.socialService.getGroupOrders(req.user.sub);
  }

  @Post('group-orders')
  async createGroupOrder(@Request() req, @Body() body: any) {
    return this.socialService.createGroupOrder(req.user.sub, body);
  }
}
