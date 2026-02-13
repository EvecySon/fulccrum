import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async getReminders(courierId: string) {
    const documents = await this.prisma.document.findMany({
      where: {
        userId: courierId,
        type: { in: ['drivers_license', 'vehicle_registration', 'insurance'] },
      },
    });

    const now = new Date();
    const reminders = documents.map(doc => {
      const expiryDate = doc.expiresAt || new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      const daysLeft = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = 'ok';
      if (daysLeft < 0) status = 'expired';
      else if (daysLeft < 7) status = 'urgent';
      else if (daysLeft < 30) status = 'warning';

      return {
        id: doc.id,
        type: doc.type === 'drivers_license' ? 'license' : doc.type === 'vehicle_registration' ? 'vehicle' : 'insurance',
        title: doc.name,
        expiryDate: expiryDate.toISOString().split('T')[0],
        daysLeft,
        status,
        notifyEnabled: true,
      };
    });

    return reminders;
  }

  async updateReminder(courierId: string, reminderId: string, data: any) {
    await this.prisma.document.update({
      where: { id: reminderId },
      data: {
        expiresAt: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });

    return { message: 'Reminder updated successfully' };
  }

  async addMaintenanceLog(courierId: string, data: any) {
    return this.prisma.maintenanceLog.create({
      data: {
        courierId,
        action: data.action,
        cost: data.cost,
        mileage: data.mileage,
        date: new Date(data.date),
      },
    });
  }

  async getMaintenanceLogs(courierId: string) {
    return this.prisma.maintenanceLog.findMany({
      where: { courierId },
      orderBy: { date: 'desc' },
      take: 50,
    });
  }
}
