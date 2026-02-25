import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getFirebaseMessaging } from '../config/firebase.config';

@Injectable()
export class AgentService {
  constructor(private prisma: PrismaService) {}

  async updateFCMToken(
    agentId: string,
    fcmToken: string,
    deviceId: string,
    platform: 'ios' | 'android' | 'web',
  ) {
    const agent = await this.prisma.user.findUnique({
      where: { id: agentId },
      select: { fcmTokens: true, deviceInfo: true },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const existingTokens = agent.fcmTokens || [];
    const existingDevices = (agent.deviceInfo as any[]) || [];

    if (!existingTokens.includes(fcmToken)) {
      existingTokens.push(fcmToken);
    }

    const deviceIndex = existingDevices.findIndex((d: any) => d.deviceId === deviceId);
    const deviceData = {
      deviceId,
      platform,
      fcmToken,
      lastUpdated: new Date(),
    };

    if (deviceIndex >= 0) {
      existingDevices[deviceIndex] = deviceData;
    } else {
      existingDevices.push(deviceData);
    }

    await this.prisma.user.update({
      where: { id: agentId },
      data: {
        fcmTokens: existingTokens,
        deviceInfo: existingDevices,
      },
    });

    return { success: true, message: 'FCM token updated successfully' };
  }

  async updateAgentStatus(agentId: string, status: string) {
    await this.prisma.user.update({
      where: { id: agentId },
      data: {
        agentStatus: status,
        lastSeen: new Date(),
      },
    });

    return { success: true, status };
  }

  async getAssignedTickets(agentId: string, status?: string) {
    const where: any = {
      assignedTo: agentId,
    };

    if (status) {
      where.status = status;
    }

    const tickets = await this.prisma.ticket.findMany({
      where,
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets;
  }

  async acknowledgeTicket(agentId: string, ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.assignedTo !== agentId) {
      throw new BadRequestException('This ticket is not assigned to you');
    }

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        acknowledgedAt: new Date(),
        acknowledgedBy: agentId,
      },
    });

    return { success: true, message: 'Ticket acknowledged' };
  }

  async getAgentMetrics(agentId: string) {
    let metrics = await this.prisma.agentMetrics.findUnique({
      where: { userId: agentId },
    });

    if (!metrics) {
      metrics = await this.prisma.agentMetrics.create({
        data: { userId: agentId },
      });
    }

    return metrics;
  }

  async sendPushNotification(
    agentId: string,
    notification: {
      title: string;
      body: string;
      data?: any;
    },
  ) {
    const messaging = getFirebaseMessaging();
    
    if (!messaging) {
      console.warn('[AGENT] Firebase messaging not available. Skipping push notification.');
      return { success: false, message: 'Firebase not configured' };
    }

    const agent = await this.prisma.user.findUnique({
      where: { id: agentId },
      select: { fcmTokens: true },
    });

    if (!agent || !agent.fcmTokens || agent.fcmTokens.length === 0) {
      console.log('[AGENT] No FCM tokens found for agent:', agentId);
      return { success: false, message: 'No FCM tokens found' };
    }

    const messages = agent.fcmTokens.map(token => ({
      token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'support_tickets',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    }));

    try {
      const response = await messaging.sendEach(messages);
      console.log('[AGENT] Notifications sent:', response.successCount);

      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(agent.fcmTokens[idx]);
        }
      });

      if (failedTokens.length > 0) {
        await this.prisma.user.update({
          where: { id: agentId },
          data: {
            fcmTokens: {
              set: agent.fcmTokens.filter(t => !failedTokens.includes(t)),
            },
          },
        });
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('[AGENT] Error sending notifications:', error);
      return { success: false, message: error.message };
    }
  }
}
