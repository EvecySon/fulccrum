import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    role: true,
                  },
                },
              },
            },
            order: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    return participants.map((p) => ({
      ...p.conversation,
      unreadCount: p.unreadCount,
    }));
  }

  async getConversation(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant of this conversation');
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async getOrCreateByOrder(orderId: string, userId: string) {
    // Check if conversation already exists for this order
    let conversation = await this.prisma.conversation.findFirst({
      where: { orderId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (conversation) {
      // Ensure user is a participant
      const isParticipant = conversation.participants.some((p) => p.userId === userId);
      if (!isParticipant) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        await this.prisma.conversationParticipant.create({
          data: {
            conversationId: conversation.id,
            userId,
            role: user?.role || 'customer',
          },
        });
      }
      return conversation;
    }

    // Create new conversation for this order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true, driverId: true, businessId: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const participantIds: { userId: string; role: string }[] = [];

    if (order.customerId) {
      participantIds.push({ userId: order.customerId, role: 'customer' });
    }
    if (order.driverId) {
      participantIds.push({ userId: order.driverId, role: 'courier' });
    }
    if (order.businessId) {
      participantIds.push({ userId: order.businessId, role: 'merchant' });
    }

    // Ensure the requesting user is included
    if (!participantIds.some((p) => p.userId === userId)) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      participantIds.push({ userId, role: user?.role || 'customer' });
    }

    conversation = await this.prisma.conversation.create({
      data: {
        orderId,
        type: 'order',
        participants: {
          create: participantIds,
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    // Verify participant
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant of this conversation');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.chatMessage.count({ where: { conversationId } }),
    ]);

    return {
      data: messages.reverse(),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    data: { text?: string; image?: string; type?: string },
  ) {
    // Verify participant
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId: senderId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant of this conversation');
    }

    const content = data.text || (data.image ? '[Image]' : '');
    const messageType = data.type || (data.image ? 'image' : 'text');

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        senderId,
        content,
        type: messageType,
        imageUrl: data.image || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    // Update conversation metadata
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
      },
    });

    // Increment unread count for other participants
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: senderId },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    return message;
  }

  async markRead(conversationId: string, userId: string) {
    await this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: {
        lastReadAt: new Date(),
        unreadCount: 0,
      },
    });

    return { success: true };
  }
}
