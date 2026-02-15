import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../../upload/upload.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async acceptOrder(courierId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.driverId && order.driverId !== courierId) {
      throw new BadRequestException('Order already assigned to another courier');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        driverId: courierId,
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });
  }

  async declineOrder(courierId: string, orderId: string, reason: string, details?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Log decline reason for analytics
    return {
      message: 'Order declined',
      reason,
      details,
    };
  }

  async updateOrderStatus(courierId: string, orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.driverId !== courierId) {
      throw new BadRequestException('You are not assigned to this order');
    }

    const updateData: any = { status };

    // Set timestamps based on status
    if (status === 'picked_up') {
      updateData.pickedUpAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });
  }

  async uploadDeliveryProof(
    courierId: string,
    orderId: string,
    file: Express.Multer.File,
    notes: string,
    deliveryType: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.driverId !== courierId) {
      throw new BadRequestException('You are not assigned to this order');
    }

    const uploadResult = await this.uploadService.uploadFile(file, 'delivery-proofs');

    return this.prisma.deliveryProof.create({
      data: {
        orderId,
        photoUrl: uploadResult.url,
        notes,
        type: deliveryType,
      },
    });
  }

  async rateCustomer(
    courierId: string,
    orderId: string,
    rating: number,
    tags: string[],
    comment?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.driverId !== courierId) {
      throw new BadRequestException('You are not assigned to this order');
    }

    return this.prisma.customerRating.create({
      data: {
        orderId,
        courierId,
        customerId: order.customerId,
        rating,
        tags,
        comment,
      },
    });
  }

  async getOrderDetails(courierId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        business: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        deliveryAddress: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getAvailableDeliveries(courierId: string, filter?: string) {
    const where: any = {
      status: 'ready',
      driverId: null,
    };

    return this.prisma.order.findMany({
      where,
      include: {
        business: true,
        deliveryAddress: true,
      },
      orderBy: { placedAt: 'desc' },
      take: 20,
    });
  }

  async markWaitingStarted(courierId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.driverId !== courierId) {
      throw new BadRequestException('You are not assigned to this order');
    }

    return {
      message: 'Waiting timer started',
      startedAt: new Date().toISOString(),
    };
  }

  async getWaitingTime(courierId: string, orderId: string) {
    return {
      waitingMinutes: 0,
      compensation: 0,
      threshold: 10,
      ratePerMinute: 50,
    };
  }

  async getOrderHistory(courierId: string, status?: string, page: number = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {
      driverId: courierId,
      status: { in: ['delivered', 'cancelled'] },
    };

    if (status) {
      where.status = status;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        business: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        items: true,
        review: true,
        deliveryAddress: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return orders.map(order => {
      const createdAt = new Date(order.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      let dateLabel: string;
      if (diffDays === 0) dateLabel = 'Today';
      else if (diffDays === 1) dateLabel = 'Yesterday';
      else if (diffDays < 7) dateLabel = `${diffDays} days ago`;
      else dateLabel = createdAt.toLocaleDateString();

      const timeLabel = createdAt.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });

      const basePay = Number(order.deliveryFee || 0);
      const tip = Number(order.tipAmount || 0);
      const bonus = 0;
      const total = basePay + tip + bonus;

      return {
        id: order.id,
        restaurant: `${order.business.user.firstName} ${order.business.user.lastName}`,
        customer: `${order.customer.firstName} ${order.customer.lastName}`,
        status: order.status,
        date: dateLabel,
        time: timeLabel,
        basePay,
        tip,
        bonus,
        total,
        distance: '0 km',
        duration: '0 min',
        items: order.items.length,
        rating: order.review?.rating || 0,
        pickupAddress: order.business.address || '',
        dropoffAddress: order.deliveryAddress?.streetAddress || '',
      };
    });
  }

  async getActiveOrders(courierId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        driverId: courierId,
        status: { in: ['accepted', 'picked_up', 'in_transit'] },
      },
      include: {
        business: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        items: true,
        deliveryAddress: true,
      },
      orderBy: { acceptedAt: 'asc' },
    });

    return orders.map((order, index) => {
      const basePay = Number(order.deliveryFee || 0);
      const tip = Number(order.tipAmount || 0);
      const total = basePay + tip;

      return {
        id: order.id,
        restaurant: `${order.business.user.firstName} ${order.business.user.lastName}`,
        customer: `${order.customer.firstName} ${order.customer.lastName}`,
        status: order.status === 'accepted' ? 'pickup' : 'delivering',
        estimatedTime: '12 min',
        pay: total,
        items: order.items.length,
        isActive: index === 0,
        pickupCoords: {
          latitude: 0,
          longitude: 0,
        },
        dropoffCoords: {
          latitude: Number(order.deliveryAddress?.latitude || 0),
          longitude: Number(order.deliveryAddress?.longitude || 0),
        },
        pickupAddress: order.business.address || '',
        dropoffAddress: order.deliveryAddress?.streetAddress || '',
      };
    });
  }

  async getEarningsSummary(courierId: string, period: 'monthly' | 'yearly', key: string) {
    let startDate: Date;
    let endDate: Date;
    let label: string;

    if (period === 'monthly') {
      // key = "2026-01"
      const [year, month] = (key || '').split('-').map(Number);
      startDate = new Date(year || 2026, (month || 1) - 1, 1);
      endDate = new Date(year || 2026, month || 1, 1);
      label = key || 'Unknown';
    } else {
      const year = parseInt(key) || new Date().getFullYear();
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
      label = key || String(new Date().getFullYear());
    }

    const orders = await this.prisma.order.findMany({
      where: {
        driverId: courierId,
        status: 'delivered',
        deliveredAt: { gte: startDate, lt: endDate },
      },
      select: {
        deliveryFee: true,
        tipAmount: true,
        totalAmount: true,
      },
    });

    const deliveryFees = orders.reduce((s, o) => s + Number(o.deliveryFee || 0), 0);
    const tips = orders.reduce((s, o) => s + Number(o.tipAmount || 0), 0);
    const totalEarnings = deliveryFees + tips;
    const deductions = 0;
    const netIncome = totalEarnings - deductions;

    return {
      key: label,
      label,
      totalEarnings,
      deliveryFees,
      tips,
      bonuses: 0,
      deductions,
      netIncome,
      deliveries: orders.length,
      distance: 0,
    };
  }
}
