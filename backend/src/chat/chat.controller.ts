import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Req() req: any) {
    return this.chatService.getConversations(req.user.sub);
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string, @Req() req: any) {
    // If the id looks like an order ID, get-or-create by order
    return this.chatService.getConversation(id, req.user.sub);
  }

  @Get('conversations/order/:orderId')
  async getOrCreateByOrder(@Param('orderId') orderId: string, @Req() req: any) {
    return this.chatService.getOrCreateByOrder(orderId, req.user.sub);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query('page') page: string,
    @Req() req: any,
  ) {
    return this.chatService.getMessages(id, req.user.sub, parseInt(page) || 1);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() body: { text?: string; image?: string; type?: string },
    @Req() req: any,
  ) {
    return this.chatService.sendMessage(id, req.user.sub, body);
  }

  @Put('conversations/:id/read')
  async markRead(@Param('id') id: string, @Req() req: any) {
    return this.chatService.markRead(id, req.user.sub);
  }
}
