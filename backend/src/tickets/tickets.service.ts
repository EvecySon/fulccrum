import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentService } from '../agent/agent.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private agentService: AgentService,
    private websocketGateway: WebSocketGateway,
  ) {}

  async createTicket(data: {
    subject: string;
    description: string;
    category: string;
    priority?: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    orderId?: string;
    merchantId?: string;
    courierId?: string;
  }) {
    const ticket = await this.prisma.ticket.create({
      data: {
        subject: data.subject,
        description: data.description,
        category: data.category as any,
        priority: (data.priority as any) || 'MEDIUM',
        customerId: data.customerId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        orderId: data.orderId,
        merchantId: data.merchantId,
        courierId: data.courierId,
        slaDeadline: this.calculateSLADeadline(data.priority || 'MEDIUM'),
      },
    });

    console.log(`[TICKETS] Created ticket #${ticket.id}`);
    return ticket;
  }

  async assignTicket(ticketId: string, agentId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        assignedAgent: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedTo: agentId,
        status: 'IN_PROGRESS',
        assignedAt: new Date(),
      },
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await this.agentService.sendPushNotification(agentId, {
      title: 'New Ticket Assigned',
      body: `${ticket.customerName} - ${ticket.subject}`,
      data: {
        type: 'ticket_assigned',
        ticketId: ticket.id,
        priority: ticket.priority,
      },
    });

    this.websocketGateway.broadcastToAgent(agentId, 'ticket_assigned', {
      type: 'ticket_assigned',
      ticketId: ticket.id,
      ticket: updatedTicket,
    });

    console.log(`[TICKETS] Assigned ticket #${ticketId} to agent ${agentId}`);
    return updatedTicket;
  }

  async autoAssignTicket(ticketId: string) {
    const availableAgents = await this.prisma.user.findMany({
      where: {
        role: 'admin',
        agentStatus: 'online',
        agentLevel: { not: null },
      },
      include: {
        agentMetrics: true,
        _count: {
          select: {
            ticketsAssigned: {
              where: {
                status: { in: ['OPEN', 'IN_PROGRESS'] },
              },
            },
          },
        },
      },
    });

    if (availableAgents.length === 0) {
      console.log('[TICKETS] No available agents for auto-assignment');
      return null;
    }

    const agent = availableAgents.reduce((prev, current) =>
      prev._count.ticketsAssigned < current._count.ticketsAssigned ? prev : current
    );

    await this.assignTicket(ticketId, agent.id);
    return agent;
  }

  async sendMessage(ticketId: string, senderId: string, message: string, isInternal = false) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        assignedAgent: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const msg = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId,
        message,
        isInternal,
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

    if (!ticket.firstResponseAt && ticket.assignedTo === senderId) {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { firstResponseAt: new Date() },
      });
    }

    if (ticket.assignedAgent && senderId !== ticket.assignedAgent.id) {
      await this.agentService.sendPushNotification(ticket.assignedAgent.id, {
        title: 'New Message',
        body: `${msg.sender.firstName}: ${message.substring(0, 50)}`,
        data: {
          type: 'new_message',
          ticketId,
        },
      });

      this.websocketGateway.broadcastToAgent(ticket.assignedAgent.id, 'new_message', {
        type: 'new_message',
        ticketId,
        message: msg,
      });
    }

    this.websocketGateway.broadcastToTicket(ticketId, 'new_message', {
      type: 'new_message',
      ticketId,
      message: msg,
    });

    return msg;
  }

  async getTicketMessages(ticketId: string) {
    const messages = await this.prisma.ticketMessage.findMany({
      where: { ticketId },
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
      orderBy: { timestamp: 'asc' },
    });

    return messages;
  }

  async updateTicketStatus(ticketId: string, status: string) {
    const updateData: any = { status };

    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    } else if (status === 'CLOSED') {
      updateData.closedAt = new Date();
    }

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
    });

    return ticket;
  }

  async getTickets(filters?: {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
  }) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.category) where.category = filters.category;
    if (filters?.assignedTo) where.assignedTo = filters.assignedTo;

    const tickets = await this.prisma.ticket.findMany({
      where,
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets;
  }

  async getTicketById(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        messages: {
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
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  private calculateSLADeadline(priority: string): Date {
    const now = new Date();
    const hours = {
      CRITICAL: 1,
      URGENT: 4,
      HIGH: 12,
      MEDIUM: 24,
      LOW: 48,
    };

    const deadline = new Date(now.getTime() + (hours[priority] || 24) * 60 * 60 * 1000);
    return deadline;
  }
}
