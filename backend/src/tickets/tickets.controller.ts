import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  async createTicket(@Request() req: any, @Body() body: any) {
    return this.ticketsService.createTicket({
      ...body,
      customerId: req.user.sub,
    });
  }

  @Post(':ticketId/assign')
  async assignTicket(@Param('ticketId') ticketId: string, @Body() body: any) {
    const { agentId } = body;
    return this.ticketsService.assignTicket(ticketId, agentId);
  }

  @Post(':ticketId/auto-assign')
  async autoAssignTicket(@Param('ticketId') ticketId: string) {
    return this.ticketsService.autoAssignTicket(ticketId);
  }

  @Post(':ticketId/messages')
  async sendMessage(
    @Request() req: any,
    @Param('ticketId') ticketId: string,
    @Body() body: any,
  ) {
    const { message, isInternal } = body;
    return this.ticketsService.sendMessage(ticketId, req.user.sub, message, isInternal);
  }

  @Get(':ticketId/messages')
  async getMessages(@Param('ticketId') ticketId: string) {
    return this.ticketsService.getTicketMessages(ticketId);
  }

  @Put(':ticketId/status')
  async updateStatus(@Param('ticketId') ticketId: string, @Body() body: any) {
    const { status } = body;
    return this.ticketsService.updateTicketStatus(ticketId, status);
  }

  @Put(':ticketId/priority')
  async updatePriority(@Param('ticketId') ticketId: string, @Body() body: any) {
    const { priority } = body;
    return this.ticketsService.updateTicketPriority(ticketId, priority);
  }

  @Post(':ticketId/refund')
  async processRefund(
    @Request() req: any,
    @Param('ticketId') ticketId: string,
    @Body() body: any,
  ) {
    return this.ticketsService.processRefund(ticketId, req.user.sub, body);
  }

  @Get()
  async getTickets(@Query() query: any) {
    return this.ticketsService.getTickets(query);
  }

  @Get('metrics/stats')
  async getTicketMetrics() {
    return this.ticketsService.getTicketMetrics();
  }

  @Get(':ticketId')
  async getTicket(@Param('ticketId') ticketId: string) {
    return this.ticketsService.getTicketById(ticketId);
  }
}
