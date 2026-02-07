import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('tickets')
  async createTicket(@Request() req: any, @Body() data: any) {
    return this.supportService.createTicket(req.user.sub, data);
  }

  @Get('tickets')
  async getTickets(@Request() req: any, @Query() filters: any) {
    return this.supportService.getTickets(req.user.sub, req.user.role, filters);
  }

  @Get('tickets/:id')
  async getTicket(@Param('id') id: string, @Request() req: any) {
    return this.supportService.getTicket(id, req.user.sub, req.user.role);
  }

  @Post('tickets/:id/messages')
  async addMessage(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    return this.supportService.addMessage(id, req.user.sub, data);
  }

  @Patch('tickets/:id/status')
  async updateStatus(@Param('id') id: string, @Body() data: any) {
    return this.supportService.updateTicketStatus(id, data.status, data);
  }

  @Patch('tickets/:id/assign')
  async assignTicket(@Param('id') id: string, @Body() data: any) {
    return this.supportService.assignTicket(id, data.assignedToId);
  }

  @Post('tickets/:id/rate')
  async rateTicket(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    return this.supportService.rateTicket(id, req.user.sub, data.rating);
  }

  @Get('stats')
  async getStats(@Query() filters: any) {
    return this.supportService.getTicketStats(filters);
  }
}
