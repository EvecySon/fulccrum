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
}
