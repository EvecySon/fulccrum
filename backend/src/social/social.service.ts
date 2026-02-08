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
        customer: { select: { firstName: true, lastName: true, avatar: true } },
        business: { select: { businessName: true } },
      },
    });

    const posts = recentReviews.map((r) => ({
      id: r.id,
      userName: `${r.customer?.firstName || 'User'} ${r.customer?.lastName?.charAt(0) || ''}.`,
      userAvatar: r.customer?.avatar || '',
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
    return [];
  }

  async createGroupOrder(userId: string, data: any) {
    return { id: `group-${Date.now()}`, ...data, hostId: userId, createdAt: new Date() };
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
