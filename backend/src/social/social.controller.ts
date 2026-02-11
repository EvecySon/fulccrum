import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('connections')
  async getConnections(@Request() req: any) {
    return this.socialService.getConnections(req.user.sub);
  }

  @Post('connections')
  async addConnection(@Request() req: any, @Body() body: { userId: string; type: string }) {
    return this.socialService.addConnection(req.user.sub, body.userId, body.type);
  }

  @Delete('connections/:connectionId')
  async removeConnection(@Request() req: any, @Param('connectionId') connectionId: string) {
    return this.socialService.removeConnection(req.user.sub, connectionId);
  }

  @Get('posts')
  async getFeed(@Request() req: any, @Query('page') page = 1) {
    return this.socialService.getFeed(req.user.sub, +page);
  }

  @Post('posts')
  async createPost(@Request() req: any, @Body() body: any) {
    return this.socialService.createPost(req.user.sub, body);
  }

  @Post('posts/:postId/like')
  async likePost(@Request() req: any, @Param('postId') postId: string) {
    return this.socialService.likePost(req.user.sub, postId);
  }

  @Post('posts/:postId/comment')
  async commentPost(@Request() req: any, @Param('postId') postId: string, @Body() body: { text: string }) {
    return this.socialService.commentPost(req.user.sub, postId, body.text);
  }

  @Get('challenges')
  async getChallenges(@Request() req: any) {
    return this.socialService.getChallenges(req.user.sub);
  }

  @Post('challenges/:challengeId/join')
  async joinChallenge(@Request() req: any, @Param('challengeId') challengeId: string) {
    return this.socialService.joinChallenge(req.user.sub, challengeId);
  }

  @Get('group-orders')
  async getGroupOrders(@Request() req: any) {
    return this.socialService.getGroupOrders(req.user.sub);
  }

  @Post('group-orders')
  async createGroupOrder(@Request() req: any, @Body() body: any) {
    return this.socialService.createGroupOrder(req.user.sub, body);
  }

  @Get('group-orders/:id')
  async getGroupOrder(@Param('id') id: string) {
    return this.socialService.getGroupOrder(id);
  }

  @Get('group-orders/join/:inviteCode')
  async getGroupOrderByCode(@Param('inviteCode') inviteCode: string) {
    return this.socialService.getGroupOrderByCode(inviteCode);
  }

  @Post('group-orders/join/:inviteCode')
  async joinGroupOrder(@Request() req: any, @Param('inviteCode') inviteCode: string) {
    return this.socialService.joinGroupOrder(req.user.sub, inviteCode);
  }

  @Post('group-orders/:id/items')
  async updateMemberItems(@Request() req: any, @Param('id') id: string, @Body() body: { items: any[]; subtotal: number }) {
    return this.socialService.updateMemberItems(req.user.sub, id, body.items, body.subtotal);
  }

  @Post('group-orders/:id/status')
  async updateMemberStatus(@Request() req: any, @Param('id') id: string, @Body() body: { status: string }) {
    return this.socialService.updateMemberStatus(req.user.sub, id, body.status);
  }

  @Delete('group-orders/:id/leave')
  async leaveGroupOrder(@Request() req: any, @Param('id') id: string) {
    return this.socialService.leaveGroupOrder(req.user.sub, id);
  }
}
