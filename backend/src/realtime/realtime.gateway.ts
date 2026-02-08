import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  path: '/socket.io',
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway {
  constructor(private readonly jwt: JwtService) {}

  @WebSocketServer()
  server!: Server;

  async handleConnection(client: Socket) {
    try {
      const token = (client.handshake.auth as any)?.token as string | undefined;
      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = await this.jwt.verifyAsync(token);
      (client.data as any).userId = payload.sub;
      (client.data as any).role = payload.role;

      client.join(`user:${payload.sub}`);
      if (payload.role) {
        client.join(`role:${payload.role}`);
      }
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('order:join')
  orderJoin(@ConnectedSocket() client: Socket, @MessageBody() orderId: string) {
    if (!orderId) return;
    client.join(`order:${orderId}`);
  }

  @SubscribeMessage('order:leave')
  orderLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() orderId: string,
  ) {
    if (!orderId) return;
    client.leave(`order:${orderId}`);
  }

  emitOrderUpdate(orderId: string, status: string, data: any) {
    this.server.to(`order:${orderId}`).emit('order:update', {
      orderId,
      status,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  emitLocationUpdate(orderId: string, driverId: string, location: { latitude: number; longitude: number }) {
    this.server.to(`order:${orderId}`).emit('location:update', {
      orderId,
      driverId,
      location,
      timestamp: new Date().toISOString(),
    });
  }

  emitNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  emitToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}
