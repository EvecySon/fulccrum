import { Controller, Post, Put, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgentService } from './agent.service';

@Controller('agent')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Post('fcm-token')
  async updateFCMToken(@Request() req: any, @Body() body: any) {
    const { fcmToken, deviceId, platform } = body;
    return this.agentService.updateFCMToken(req.user.sub, fcmToken, deviceId, platform);
  }

  @Put('status')
  async updateStatus(@Request() req: any, @Body() body: any) {
    const { status } = body;
    return this.agentService.updateAgentStatus(req.user.sub, status);
  }

  @Get('tickets')
  async getTickets(@Request() req: any) {
    return this.agentService.getAssignedTickets(req.user.sub);
  }

  @Post('acknowledge/:ticketId')
  async acknowledgeTicket(@Request() req: any, @Param('ticketId') ticketId: string) {
    return this.agentService.acknowledgeTicket(req.user.sub, ticketId);
  }

  @Get('metrics')
  async getMetrics(@Request() req: any) {
    return this.agentService.getAgentMetrics(req.user.sub);
  }

  @Get('list')
  async listAgents() {
    return this.agentService.listAvailableAgents();
  }
}
