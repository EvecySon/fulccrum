import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async getConnections(userId: string) {
    // Return user's social connections (friends/followers)
    return [];
  }

  async addConnection(userId: string, targetUserId: string, type: string) {
    return { message: 'Connection added', userId: targetUserId, type };
  }

  async removeConnection(userId: string, connectionId: string) {
    return { message: 'Connection removed', id: connectionId };
  }

  async getFeed(userId: string, page: number) {
    // Build a social feed from recent orders/reviews in the user's area
    const recentReviews = await this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
      include: {
        customer: { select: { firstName: true, lastName: true, avatarUrl: true } },
        business: { select: { businessName: true } },
      },
    });

    const posts = recentReviews.map((r) => ({
      id: r.id,
      userName: `${r.customer?.firstName || 'User'} ${r.customer?.lastName?.charAt(0) || ''}.`,
      userAvatar: r.customer?.avatarUrl || '',
      image: '',
      caption: r.comment || `Rated ${r.rating}/5`,
      restaurant: r.business?.businessName || '',
      likes: 0,
      liked: false,
      comments: 0,
      timeAgo: getTimeAgo(r.createdAt),
    }));

    return { posts, page, hasMore: recentReviews.length === 20 };
  }

  async createPost(userId: string, data: any) {
    return { id: `post-${Date.now()}`, ...data, userId, createdAt: new Date() };
  }

  async likePost(userId: string, postId: string) {
    return { message: 'Post liked', postId };
  }

  async commentPost(userId: string, postId: string, text: string) {
    return { id: `comment-${Date.now()}`, postId, text, userId, createdAt: new Date() };
  }

  async getChallenges(userId: string) {
    return [];
  }

  async joinChallenge(userId: string, challengeId: string) {
    return { message: 'Joined challenge', challengeId };
  }

  async getGroupOrders(userId: string) {
    // Get group orders where user is host or member
    const asHost = await this.prisma.groupOrder.findMany({
      where: { hostId: userId, status: { in: ['open', 'locked'] } },
      include: {
        business: { select: { businessName: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const asMember = await this.prisma.groupOrder.findMany({
      where: {
        members: { some: { userId } },
        hostId: { not: userId },
        status: { in: ['open', 'locked'] },
      },
      include: {
        business: { select: { businessName: true } },
        host: { select: { id: true, firstName: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return [...asHost, ...asMember];
  }

  async getGroupOrder(groupOrderId: string) {
    return this.prisma.groupOrder.findUnique({
      where: { id: groupOrderId },
      include: {
        business: { select: { businessName: true } },
        host: { select: { id: true, firstName: true, lastName: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
  }

  async getGroupOrderByCode(inviteCode: string) {
    return this.prisma.groupOrder.findUnique({
      where: { inviteCode },
      include: {
        business: { select: { businessName: true } },
        host: { select: { id: true, firstName: true, lastName: true } },
        members: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
  }

  async createGroupOrder(userId: string, data: any) {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const group = await this.prisma.groupOrder.create({
      data: {
        hostId: userId,
        businessId: data.businessId,
        inviteCode,
        deliveryFee: data.deliveryFee || 0,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 30 * 60 * 1000), // 30 min default
      },
    });

    // Auto-add host as first member
    await this.prisma.groupOrderMember.create({
      data: {
        groupOrderId: group.id,
        userId,
        status: 'ordering',
      },
    });

    return this.getGroupOrder(group.id);
  }

  async joinGroupOrder(userId: string, inviteCode: string) {
    const group = await this.prisma.groupOrder.findUnique({
      where: { inviteCode },
      include: { members: true },
    });
    if (!group) throw new Error('Group order not found');
    if (group.status !== 'open') throw new Error('Group order is no longer accepting members');
    if (group.members.some(m => m.userId === userId)) throw new Error('You are already in this group');

    await this.prisma.groupOrderMember.create({
      data: { groupOrderId: group.id, userId, status: 'pending' },
    });

    return this.getGroupOrder(group.id);
  }

  async updateMemberItems(userId: string, groupOrderId: string, items: any[], subtotal: number) {
    await this.prisma.groupOrderMember.updateMany({
      where: { groupOrderId, userId },
      data: { items: items as any, subtotal, status: 'ready' },
    });
    return this.getGroupOrder(groupOrderId);
  }

  async updateMemberStatus(userId: string, groupOrderId: string, status: string) {
    await this.prisma.groupOrderMember.updateMany({
      where: { groupOrderId, userId },
      data: { status },
    });
    return this.getGroupOrder(groupOrderId);
  }

  async leaveGroupOrder(userId: string, groupOrderId: string) {
    await this.prisma.groupOrderMember.deleteMany({
      where: { groupOrderId, userId },
    });
    return { message: 'Left group order' };
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
