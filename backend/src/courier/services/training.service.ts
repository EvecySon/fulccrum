import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  async getTrainingModules(courierId: string) {
    const modules = await this.prisma.trainingModule.findMany({
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
      ],
    });

    const progress = await this.prisma.courierTrainingProgress.findMany({
      where: { courierId },
    });

    const progressMap = new Map(progress.map(p => [p.moduleId, p]));

    return modules.map(module => {
      const prog = progressMap.get(module.id);
      const completed = prog ? prog.completedLessons >= module.lessons : false;

      return {
        id: module.id,
        title: module.title,
        description: module.description,
        icon: module.icon,
        color: module.color,
        duration: module.duration,
        lessons: module.lessons,
        completedLessons: prog?.completedLessons || 0,
        required: module.required,
        category: module.category,
        completed,
      };
    });
  }

  async completeLesson(courierId: string, moduleId: string) {
    const module = await this.prisma.trainingModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new Error('Training module not found');
    }

    const progress = await this.prisma.courierTrainingProgress.upsert({
      where: {
        courierId_moduleId: { courierId, moduleId },
      },
      create: {
        courierId,
        moduleId,
        completedLessons: 1,
      },
      update: {
        completedLessons: { increment: 1 },
      },
    });

    return {
      message: 'Lesson completed',
      completedLessons: progress.completedLessons,
      totalLessons: module.lessons,
      moduleCompleted: progress.completedLessons >= module.lessons,
    };
  }

  async getTrainingProgress(courierId: string) {
    const modules = await this.prisma.trainingModule.findMany();
    const progress = await this.prisma.courierTrainingProgress.findMany({
      where: { courierId },
      include: { module: true },
    });

    const totalModules = modules.length;
    const completedModules = progress.filter(
      p => p.completedLessons >= p.module.lessons
    ).length;

    const requiredModules = modules.filter(m => m.required);
    const requiredCompleted = progress.filter(
      p => p.module.required && p.completedLessons >= p.module.lessons
    ).length;

    const percentComplete = totalModules > 0
      ? Math.round((completedModules / totalModules) * 100)
      : 0;

    return {
      totalModules,
      completedModules,
      requiredCompleted,
      requiredTotal: requiredModules.length,
      percentComplete,
    };
  }
}
