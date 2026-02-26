import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@WebSocketGateway({
  path: '/support',
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
})
export class SupportWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const agentId = client.handshake.auth.agentId;

      if (!token || !agentId) {
        throw new UnauthorizedException('Missing authentication credentials');
      }

      const decoded = this.jwtService.verify(token);
      
      if (decoded.sub !== agentId) {
        throw new UnauthorizedException('Invalid agent ID');
      }

      client.data.agentId = agentId;
      client.data.user = decoded;

      client.join(`agent-${agentId}`);

      await this.updateAgentStatus(agentId, 'online');

      console.log(`[WEBSOCKET] Agent ${agentId} connected`);
    } catch (error) {
      console.error('[WEBSOCKET] Connection error:', error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const agentId = client.data.agentId;
    
    if (agentId) {
      await this.updateAgentStatus(agentId, 'offline');
      console.log(`[WEBSOCKET] Agent ${agentId} disconnected`);
    }
  }

  @SubscribeMessage('agent_status')
  async handleAgentStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { status: string },
  ) {
    const agentId = client.data.agentId;
    await this.updateAgentStatus(agentId, data.status);
    
    return { success: true, status: data.status };
  }

  @SubscribeMessage('join_ticket')
  handleJoinTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    client.join(`ticket-${data.ticketId}`);
    console.log(`[WEBSOCKET] Agent ${client.data.agentId} joined ticket ${data.ticketId}`);
    
    return { success: true };
  }

  @SubscribeMessage('leave_ticket')
  handleLeaveTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    client.leave(`ticket-${data.ticketId}`);
    console.log(`[WEBSOCKET] Agent ${client.data.agentId} left ticket ${data.ticketId}`);
    
    return { success: true };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string; message: string },
  ) {
    const agentId = client.data.agentId;

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId: data.ticketId,
        senderId: agentId,
        message: data.message,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.server.to(`ticket-${data.ticketId}`).emit('new_message', {
      type: 'new_message',
      ticketId: data.ticketId,
      message,
    });

    return { success: true, message };
  }

  @SubscribeMessage('acknowledge_ticket')
  async handleAcknowledgeTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    const agentId = client.data.agentId;

    await this.prisma.ticket.update({
      where: { id: data.ticketId },
      data: {
        acknowledgedAt: new Date(),
        acknowledgedBy: agentId,
      },
    });

    return { success: true };
  }

  private async updateAgentStatus(agentId: string, status: string) {
    await this.prisma.user.update({
      where: { id: agentId },
      data: {
        agentStatus: status,
        lastSeen: new Date(),
      },
    });
  }

  broadcastToAgent(agentId: string, event: string, data: any) {
    this.server.to(`agent-${agentId}`).emit(event, data);
  }

  broadcastToTicket(ticketId: string, event: string, data: any) {
    this.server.to(`ticket-${ticketId}`).emit(event, data);
  }

  broadcastToAllAgents(event: string, data: any) {
    this.server.emit(event, data);
  }
}
