import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InsuranceService {
  constructor(private prisma: PrismaService) {}

  async getCurrentPlan(courierId: string) {
    // Default to standard plan for now
    return {
      id: '2',
      name: 'Standard Protection',
      type: 'standard',
      monthlyPremium: 3500,
      coverage: ['Accident coverage up to ₦500,000', 'Third-party liability'],
      maxCoverage: 500000,
      active: true,
    };
  }

  async getAvailablePlans() {
    return this.prisma.insurancePlan.findMany({
      where: { active: true },
      orderBy: { monthlyPremium: 'asc' },
    });
  }

  async changePlan(courierId: string, planId: string) {
    const plan = await this.prisma.insurancePlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Insurance plan not found');
    }

    return { message: 'Insurance plan updated successfully', plan };
  }

  async fileClaim(courierId: string, data: any) {
    return this.prisma.insuranceClaim.create({
      data: {
        courierId,
        type: data.type,
        description: data.description,
        amount: data.amount,
        status: 'pending',
      },
    });
  }

  async getClaims(courierId: string) {
    return this.prisma.insuranceClaim.findMany({
      where: { courierId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
