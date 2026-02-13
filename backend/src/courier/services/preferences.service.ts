import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PreferencesService {
  constructor(private prisma: PrismaService) {}

  async getPreferences(courierId: string) {
    let preferences = await this.prisma.courierPreferences.findUnique({
      where: { courierId },
    });

    if (!preferences) {
      preferences = await this.prisma.courierPreferences.create({
        data: { courierId },
      });
    }

    return preferences;
  }

  async updatePreferences(courierId: string, data: any) {
    return this.prisma.courierPreferences.upsert({
      where: { courierId },
      create: { courierId, ...data },
      update: data,
    });
  }
}
