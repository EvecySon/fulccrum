import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
export declare class RealtimeGateway {
    private readonly jwt;
    constructor(jwt: JwtService);
    server: Server;
    handleConnection(client: Socket): Promise<void>;
    orderJoin(client: Socket, orderId: string): void;
    orderLeave(client: Socket, orderId: string): void;
}
