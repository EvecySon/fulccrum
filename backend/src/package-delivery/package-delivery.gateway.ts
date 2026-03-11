import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { CourierMatchingService } from './courier-matching.service';

@WebSocketGateway({ cors: true })
export class PackageDeliveryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private courierSockets = new Map<string, string>();

  constructor(
    private prisma: PrismaService,
    private courierMatching: CourierMatchingService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    for (const [courierId, socketId] of this.courierSockets.entries()) {
      if (socketId === client.id) {
        this.courierSockets.delete(courierId);
        break;
      }
    }
  }

  @SubscribeMessage('courier-register')
  handleCourierRegister(client: Socket, data: { courierId: string }) {
    this.courierSockets.set(data.courierId, client.id);
    client.join(`courier-${data.courierId}`);
  }

  @SubscribeMessage('track-delivery')
  handleTrackDelivery(client: Socket, data: { orderId: string }) {
    client.join(`delivery-${data.orderId}`);
  }

  @SubscribeMessage('courier-location-update')
  async handleLocationUpdate(
    client: Socket,
    data: {
      courierId: string;
      lat: number;
      lng: number;
      heading?: number;
      speed?: number;
    },
  ) {
    await this.prisma.courierLocation.create({
      data: {
        courierId: data.courierId,
        latitude: data.lat,
        longitude: data.lng,
        heading: data.heading,
        speed: data.speed,
      },
    });

    const activeDeliveries = await this.prisma.order.findMany({
      where: {
        driverId: data.courierId,
        status: { in: ['accepted', 'picked_up'] },
        orderType: 'package_delivery',
      },
    });

    for (const delivery of activeDeliveries) {
      this.server.to(`delivery-${delivery.id}`).emit('courier-moved', {
        lat: data.lat,
        lng: data.lng,
        heading: data.heading,
        speed: data.speed,
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('accept-delivery')
  async handleAcceptDelivery(
    client: Socket,
    data: { requestId: string; courierId: string },
  ) {
    const result = await this.courierMatching.handleCourierAcceptance(
      data.requestId,
      data.courierId,
    );

    if (result.success) {
      const request = await this.prisma.deliveryRequest.findUnique({
        where: { id: data.requestId },
        include: { order: true },
      });

      this.server.to(`delivery-${request.orderId}`).emit('courier-assigned', {
        courierId: data.courierId,
        message: 'Courier is on the way!',
      });
    }

    client.emit('accept-delivery-response', result);
  }

  @SubscribeMessage('update-delivery-status')
  async handleStatusUpdate(
    client: Socket,
    data: {
      orderId: string;
      status: string;
      photoUrl?: string;
    },
  ) {
    await this.prisma.order.update({
      where: { id: data.orderId },
      data: {
        status: data.status as any,
        ...(data.status === 'picked_up' && { pickedUpAt: new Date(), packagePhoto: data.photoUrl }),
        ...(data.status === 'delivered' && { deliveredAt: new Date() }),
      },
    });

    this.server.to(`delivery-${data.orderId}`).emit('status-updated', {
      status: data.status,
      timestamp: new Date(),
    });
  }
}
