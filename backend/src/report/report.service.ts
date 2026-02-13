import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async reportContent(
    userId: string,
    data: { type: string; resourceId: string; reason: string; details?: string },
  ) {
    // Add to the content moderation queue with user-reported flags
    const item = await this.prisma.contentModerationQueue.create({
      data: {
        type: data.type as any,
        resourceId: data.resourceId,
        resourceData: { reportedBy: userId, reason: data.reason, details: data.details || '' },
        flags: [data.reason],
        status: 'pending',
      },
    });

    return { message: 'Report submitted successfully', id: item.id };
  }

  async getMyReports(userId: string) {
    const reports = await this.prisma.contentModerationQueue.findMany({
      where: {
        resourceData: {
          path: ['reportedBy'],
          equals: userId,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { data: reports };
  }
}
