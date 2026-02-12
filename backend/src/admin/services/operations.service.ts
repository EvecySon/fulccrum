import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OperationsService {
  constructor(private prisma: PrismaService) {}

  // Incident Management
  async createIncident(data: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    orderId?: string;
    businessId?: string;
    driverId?: string;
    description: string;
    assignedTo?: string;
  }) {
    return this.prisma.incident.create({
      data: {
        type: data.type,
        severity: data.severity,
        orderId: data.orderId,
        businessId: data.businessId,
        driverId: data.driverId,
        description: data.description,
        assignedTo: data.assignedTo,
        status: 'open',
      },
    });
  }

  async getIncidents(filters?: {
    status?: string;
    severity?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.type) where.type = filters.type;

    const [incidents, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            select: {
              orderNumber: true,
              customer: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.incident.count({ where }),
    ]);

    return {
      data: incidents,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async resolveIncident(incidentId: string, resolution: string) {
    return this.prisma.incident.update({
      where: { id: incidentId },
      data: {
        status: 'resolved',
        resolution,
        resolvedAt: new Date(),
      },
    });
  }

  async assignIncident(incidentId: string, assignedTo: string) {
    return this.prisma.incident.update({
      where: { id: incidentId },
      data: { assignedTo, status: 'investigating' },
    });
  }

  // SLA Management
  async createSLAConfig(data: {
    name: string;
    orderType: string;
    maxPrepTime: number;
    maxDeliveryTime: number;
    maxTotalTime: number;
    breachAction: string;
  }) {
    return this.prisma.sLAConfig.create({ data });
  }

  async getSLAConfigs() {
    return this.prisma.sLAConfig.findMany({
      where: { isActive: true },
      orderBy: { orderType: 'asc' },
    });
  }

  async checkSLABreach(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { business: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const slaConfig = await this.prisma.sLAConfig.findFirst({
      where: {
        orderType: order.business.businessType,
        isActive: true,
      },
    });

    if (!slaConfig) return { breached: false };

    const now = new Date();
    const orderAge = (now.getTime() - order.placedAt.getTime()) / 60000; // minutes

    const breaches: string[] = [];
    if (order.status === 'preparing' && order.acceptedAt) {
      const prepTime = (now.getTime() - order.acceptedAt.getTime()) / 60000;
      if (prepTime > slaConfig.maxPrepTime) {
        breaches.push('prep_time');
      }
    }

    if (order.status === 'in_transit' && order.pickedUpAt) {
      const deliveryTime = (now.getTime() - order.pickedUpAt.getTime()) / 60000;
      if (deliveryTime > slaConfig.maxDeliveryTime) {
        breaches.push('delivery_time');
      }
    }

    if (orderAge > slaConfig.maxTotalTime && order.status !== 'delivered') {
      breaches.push('total_time');
    }

    if (breaches.length > 0) {
      // Create incident
      await this.createIncident({
        type: 'sla_breach',
        severity: 'high',
        orderId: order.id,
        description: `SLA breach detected: ${breaches.join(', ')}`,
      });

      return { breached: true, breaches, slaConfig };
    }

    return { breached: false };
  }

  async getSLABreaches(startDate: Date, endDate: Date) {
    const incidents = await this.prisma.incident.findMany({
      where: {
        type: 'sla_breach',
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            business: { select: { businessName: true } },
          },
        },
      },
    });

    return incidents;
  }

  // Delivery Zones
  async createDeliveryZone(data: {
    name: string;
    polygon: any;
    baseFee: number;
    perKmRate: number;
    maxDeliveryRadius: number;
    city?: string;
  }) {
    return this.prisma.deliveryZone.create({
      data: {
        name: data.name,
        polygon: data.polygon,
        baseFee: new Prisma.Decimal(data.baseFee),
        perKmRate: new Prisma.Decimal(data.perKmRate),
        maxDeliveryRadius: data.maxDeliveryRadius,
        city: data.city,
      },
    });
  }

  async getDeliveryZones(city?: string) {
    return this.prisma.deliveryZone.findMany({
      where: {
        isActive: true,
        ...(city && { city }),
      },
    });
  }

  async updateDeliveryZone(zoneId: string, data: Partial<{
    name: string;
    baseFee: number;
    perKmRate: number;
    surgeMultiplier: number;
    isActive: boolean;
  }>) {
    const updateData: any = { ...data };
    if (data.baseFee !== undefined) updateData.baseFee = new Prisma.Decimal(data.baseFee);
    if (data.perKmRate !== undefined) updateData.perKmRate = new Prisma.Decimal(data.perKmRate);
    if (data.surgeMultiplier !== undefined) updateData.surgeMultiplier = new Prisma.Decimal(data.surgeMultiplier);

    return this.prisma.deliveryZone.update({
      where: { id: zoneId },
      data: updateData,
    });
  }

  // Live Operations Dashboard Data
  async getLiveOperationsData() {
    const activeOrders = await this.prisma.order.findMany({
      where: {
        status: { in: ['preparing', 'ready', 'picked_up', 'in_transit'] },
      },
      include: {
        customer: { select: { firstName: true, lastName: true } },
        business: { select: { businessName: true } },
        driver: { select: { firstName: true, lastName: true } },
        deliveryAddress: true,
      },
    });

    const activeDrivers = await this.prisma.driverProfile.count({
      where: { onlineStatus: true },
    });

    const openIncidents = await this.prisma.incident.count({
      where: { status: { in: ['open', 'investigating'] } },
    });

    return {
      activeOrders: activeOrders.length,
      activeDrivers,
      openIncidents,
      orders: activeOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        customer: `${o.customer.firstName} ${o.customer.lastName}`,
        business: o.business.businessName,
        driver: o.driver ? `${o.driver.firstName} ${o.driver.lastName}` : null,
        deliveryAddress: o.deliveryAddress,
        estimatedDeliveryTime: o.estimatedDeliveryTime,
      })),
    };
  }
}
