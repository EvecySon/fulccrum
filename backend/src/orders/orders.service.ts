import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService,
    @Inject(forwardRef(() => RealtimeGateway))
    private realtimeGateway: RealtimeGateway,
  ) {}

  async createOrder(customerId: string, dto: CreateOrderDto) {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId,
        businessId: dto.businessId,
        status: 'pending',
        subtotal: dto.subtotal,
        deliveryFee: dto.deliveryFee,
        serviceFee: dto.serviceFee,
        taxAmount: dto.taxAmount,
        tipAmount: dto.tipAmount || 0,
        discountAmount: dto.discountAmount || 0,
        totalAmount: dto.totalAmount,
        specialInstructions: dto.specialInstructions,
        paymentMethod: dto.paymentMethod,
        paymentStatus: 'pending',
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return order;
  }

  async getOrder(orderId: string, userId: string, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        driver: {
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

    if (userRole !== 'admin' && order.customerId !== userId && order.driverId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto, userId: string, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userRole !== 'admin' && userRole !== 'business_owner' && userRole !== 'driver') {
      throw new ForbiddenException('Only business owners, drivers, or admins can update order status');
    }

    const updateData: any = {
      status: dto.status,
    };

    if (dto.status === 'accepted') {
      updateData.acceptedAt = new Date();
    } else if (dto.status === 'preparing') {
      updateData.preparationStartedAt = new Date();
    } else if (dto.status === 'ready') {
      updateData.readyAt = new Date();
    } else if (dto.status === 'picked_up') {
      updateData.pickedUpAt = new Date();
      if (dto.driverId) {
        updateData.driverId = dto.driverId;
      }
    } else if (dto.status === 'delivered') {
      updateData.deliveredAt = new Date();
      updateData.paymentStatus = 'completed';
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (dto.status === 'delivered') {
      await this.walletService.creditOrderEarnings(
        updatedOrder.id,
        updatedOrder.businessId,
        updatedOrder.driverId,
        Number(updatedOrder.totalAmount),
        Number(updatedOrder.deliveryFee),
      );
    }

    this.realtimeGateway.emitOrderUpdate(updatedOrder.id, dto.status, {
      orderNumber: updatedOrder.orderNumber,
      customer: updatedOrder.customer,
      driver: updatedOrder.driver,
    });

    return updatedOrder;
  }

  async getCustomerOrders(customerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          estimatedDeliveryTime: true,
        },
      }),
      this.prisma.order.count({ where: { customerId } }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDriverOrders(driverId: string, status?: string) {
    const where: any = { driverId };
    
    if (status) {
      where.status = status;
    }

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
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

    return orders;
  }

  async getBusinessOrders(businessId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where: { businessId } }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async assignDriver(orderId: string, driverId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'ready') {
      throw new ForbiddenException('Order must be ready before assigning a driver');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        driverId,
        status: 'picked_up',
        pickedUpAt: new Date(),
      },
    });
  }

  async getAvailableDeliveries(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          status: 'ready',
          driverId: null,
        },
        skip,
        take: limit,
        include: {
          business: {
            select: {
              businessName: true,
              phone: true,
              addresses: {
                take: 1,
                select: {
                  streetAddress: true,
                  city: true,
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
          customer: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy: { readyAt: 'asc' },
      }),
      this.prisma.order.count({
        where: {
          status: 'ready',
          driverId: null,
        },
      }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
