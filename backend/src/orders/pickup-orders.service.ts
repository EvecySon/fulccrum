import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class PickupOrdersService {
  constructor(
    private prisma: PrismaService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async markOrderReadyForPickup(orderId: string, businessId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.businessId !== businessId) {
      throw new BadRequestException('You can only update your own orders');
    }

    if (order.fulfillmentType !== 'pickup') {
      throw new BadRequestException('This order is not a pickup order');
    }

    if (order.status !== 'preparing') {
      throw new BadRequestException('Order must be in preparing status');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ready_for_pickup',
        readyAt: new Date(),
      },
      include: {
        customer: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Notify customer via WebSocket
    this.realtimeGateway.emitToUser(order.customerId, 'order:ready_for_pickup', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: 'Your order is ready for pickup!',
    });

    return updatedOrder;
  }

  async confirmPickup(orderId: string, businessId: string, pickupCode?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.businessId !== businessId) {
      throw new BadRequestException('You can only update your own orders');
    }

    if (order.fulfillmentType !== 'pickup') {
      throw new BadRequestException('This order is not a pickup order');
    }

    if (order.status !== 'ready_for_pickup') {
      throw new BadRequestException('Order must be ready for pickup');
    }

    // Optional: Verify pickup code if implemented
    // if (pickupCode && order.pickupCode !== pickupCode) {
    //   throw new BadRequestException('Invalid pickup code');
    // }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'delivered',
        deliveredAt: new Date(),
        pickedUpAt: new Date(),
      },
    });

    // Notify customer
    this.realtimeGateway.emitToUser(order.customerId, 'order:picked_up', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: 'Order picked up successfully!',
    });

    return updatedOrder;
  }

  async getPickupOrders(businessId: string, status?: string) {
    const where: any = {
      businessId,
      fulfillmentType: 'pickup',
    };

    if (status) {
      where.status = status;
    } else {
      // Default: show active pickup orders
      where.status = {
        in: ['pending', 'accepted', 'preparing', 'ready_for_pickup'],
      };
    }

    return this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }

  async getCustomerPickupOrders(customerId: string) {
    return this.prisma.order.findMany({
      where: {
        customerId,
        fulfillmentType: 'pickup',
        status: {
          in: ['pending', 'accepted', 'preparing', 'ready_for_pickup'],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: {
            businessName: true,
            phone: true,
            address: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
