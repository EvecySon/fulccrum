import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

export interface CreateTemplateDto {
  key: string;
  name: string;
  description?: string;
  title: string;
  body: string;
  type: NotificationType;
  category: string;
  targetRole: string[];
  isScheduled?: boolean;
  scheduleTime?: string;
  isActive?: boolean;
  variant?: string;
  variantGroup?: string;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}

@Injectable()
export class NotificationTemplateService {
  constructor(private prisma: PrismaService) {}

  async createTemplate(dto: CreateTemplateDto, createdBy: string) {
    return this.prisma.notificationTemplate.create({
      data: {
        ...dto,
        createdBy,
      },
    });
  }

  async getAllTemplates(filters?: {
    type?: NotificationType;
    category?: string;
    isActive?: boolean;
  }) {
    return this.prisma.notificationTemplate.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getTemplateByKey(key: string) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { key },
    });

    if (!template) {
      throw new NotFoundException(`Template with key '${key}' not found`);
    }

    return template;
  }

  async getActiveTemplate(key: string) {
    let template = await this.prisma.notificationTemplate.findFirst({
      where: {
        key,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!template) {
      template = await this.prisma.notificationTemplate.findFirst({
        where: {
          key,
          isDefault: true,
        },
      });
    }

    return template;
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto) {
    return this.prisma.notificationTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTemplate(id: string) {
    return this.prisma.notificationTemplate.delete({
      where: { id },
    });
  }

  async toggleActive(id: string) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id },
    });

    return this.prisma.notificationTemplate.update({
      where: { id },
      data: { isActive: !template.isActive },
    });
  }

  async getScheduledTemplates() {
    return this.prisma.notificationTemplate.findMany({
      where: {
        isScheduled: true,
        isActive: true,
      },
    });
  }

  replacePlaceholders(
    template: string,
    variables: Record<string, string | number>,
  ): string {
    let result = template;
    
    Object.keys(variables).forEach((key) => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(variables[key]));
    });
    
    return result;
  }

  async getRandomVariant(variantGroup: string) {
    const variants = await this.prisma.notificationTemplate.findMany({
      where: {
        variantGroup,
        isActive: true,
      },
    });

    if (variants.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * variants.length);
    return variants[randomIndex];
  }

  async incrementSentCount(templateId: string) {
    return this.prisma.notificationTemplate.update({
      where: { id: templateId },
      data: {
        sentCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }

  async incrementOpenCount(templateId: string) {
    return this.prisma.notificationTemplate.update({
      where: { id: templateId },
      data: { openCount: { increment: 1 } },
    });
  }

  async incrementClickCount(templateId: string) {
    return this.prisma.notificationTemplate.update({
      where: { id: templateId },
      data: { clickCount: { increment: 1 } },
    });
  }

  async getTemplateAnalytics(templateId: string) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const openRate = template.sentCount > 0
      ? (template.openCount / template.sentCount) * 100
      : 0;

    const clickRate = template.sentCount > 0
      ? (template.clickCount / template.sentCount) * 100
      : 0;

    return {
      ...template,
      openRate: openRate.toFixed(2),
      clickRate: clickRate.toFixed(2),
    };
  }
}
