import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SupportService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createTicket(userId: string, data: any) {
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    return this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        category: data.category,
        priority: data.priority || 'medium',
        subject: data.subject,
        description: data.description,
        attachments: data.attachments || [],
        orderId: data.orderId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getTickets(userId: string, userRole: string, filters: any = {}) {
    const where: any = {};

    if (userRole !== 'admin' && userRole !== 'support_agent') {
      where.userId = userId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTicket(ticketId: string, userId: string, userRole: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (userRole !== 'admin' && userRole !== 'support_agent' && ticket.userId !== userId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    return ticket;
  }

  async addMessage(ticketId: string, userId: string, data: any) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: userId,
        message: data.message,
        attachments: data.attachments || [],
        isInternal: data.isInternal || false,
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Update ticket status if it was closed
    if (ticket.status === 'closed') {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'open' },
      });
    }

    // Notify customer when an agent/admin replies (sender is not the ticket owner)
    if (userId !== ticket.userId) {
      try {
        await this.notificationsService.createNotification(ticket.userId, {
          type: 'support_message',
          title: 'Support reply received',
          message: `A support agent has replied to your ticket: "${ticket.subject}"`,
          data: { ticketId, screen: 'CustomerTicketDetail' },
        });
      } catch (e) {
        console.warn('[Support] Failed to notify customer:', e);
      }
    }

    return message;
  }

  async updateTicketStatus(ticketId: string, status: string, data: any = {}) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const updateData: any = { status };

    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
      if (data.resolution) {
        updateData.resolution = data.resolution;
      }
    }

    if (status === 'closed') {
      updateData.closedAt = new Date();
    }

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });
  }

  async assignTicket(ticketId: string, assignedToId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedToId,
        status: ticket.status === 'open' ? 'in_progress' : ticket.status,
      },
    });
  }

  async rateTicket(ticketId: string, userId: string, rating: number) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('You can only rate your own tickets');
    }

    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      throw new BadRequestException('You can only rate resolved or closed tickets');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { satisfactionRating: rating },
    });
  }

  async getTicketStats(filters: any = {}) {
    const where: any = {};

    if (filters.startDate) {
      where.createdAt = { gte: new Date(filters.startDate) };
    }

    if (filters.endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) };
    }

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      avgRating,
    ] = await Promise.all([
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'open' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'in_progress' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'resolved' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'closed' } }),
      this.prisma.supportTicket.aggregate({
        where: { ...where, satisfactionRating: { not: null } },
        _avg: { satisfactionRating: true },
      }),
    ]);

    const categoryBreakdown = await this.prisma.supportTicket.groupBy({
      by: ['category'],
      where,
      _count: true,
    });

    const priorityBreakdown = await this.prisma.supportTicket.groupBy({
      by: ['priority'],
      where,
      _count: true,
    });

    return {
      totalTickets,
      statusBreakdown: {
        open: openTickets,
        in_progress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
      },
      categoryBreakdown: categoryBreakdown.reduce((acc: Record<string, any>, item: any) => {
        acc[item.category] = item._count;
        return acc;
      }, {}),
      priorityBreakdown: priorityBreakdown.reduce((acc: Record<string, any>, item: any) => {
        acc[item.priority] = item._count;
        return acc;
      }, {}),
      averageSatisfactionRating: avgRating._avg.satisfactionRating || 0,
    };
  }
}
