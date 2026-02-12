import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateCompliance(data: {
    businessId: string;
    licenseNumber?: string;
    licenseExpiry?: Date;
    healthPermit?: string;
    permitExpiry?: Date;
    insurancePolicy?: string;
    insuranceExpiry?: Date;
    taxId?: string;
    documents?: any;
    notes?: string;
  }) {
    const existing = await this.prisma.merchantCompliance.findUnique({
      where: { businessId: data.businessId },
    });

    const status = this.calculateStatus(data);
    const nextCheckDue = this.calculateNextCheckDue(data);

    if (existing) {
      return this.prisma.merchantCompliance.update({
        where: { businessId: data.businessId },
        data: {
          ...data,
          status,
          lastChecked: new Date(),
          nextCheckDue,
        },
      });
    }

    return this.prisma.merchantCompliance.create({
      data: {
        businessId: data.businessId,
        licenseNumber: data.licenseNumber,
        licenseExpiry: data.licenseExpiry,
        healthPermit: data.healthPermit,
        permitExpiry: data.permitExpiry,
        insurancePolicy: data.insurancePolicy,
        insuranceExpiry: data.insuranceExpiry,
        taxId: data.taxId,
        documents: data.documents,
        status,
        lastChecked: new Date(),
        nextCheckDue,
        notes: data.notes,
      },
    });
  }

  async getCompliance(businessId: string) {
    const compliance = await this.prisma.merchantCompliance.findUnique({
      where: { businessId },
      include: {
        business: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });
    if (!compliance) throw new NotFoundException('Compliance record not found');
    return compliance;
  }

  async getAllCompliance(filters?: {
    status?: string;
    expiringSoon?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.nextCheckDue = { lte: thirtyDaysFromNow };
    }

    const [records, total] = await Promise.all([
      this.prisma.merchantCompliance.findMany({
        where,
        skip,
        take: limit,
        include: {
          business: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
        },
        orderBy: { nextCheckDue: 'asc' },
      }),
      this.prisma.merchantCompliance.count({ where }),
    ]);

    return {
      data: records,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async checkCompliance(businessId: string) {
    const compliance = await this.getCompliance(businessId);
    const status = this.calculateStatus(compliance);
    const nextCheckDue = this.calculateNextCheckDue(compliance);

    return this.prisma.merchantCompliance.update({
      where: { businessId },
      data: {
        status,
        lastChecked: new Date(),
        nextCheckDue,
      },
    });
  }

  private calculateStatus(data: any): string {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiryDates = [
      data.licenseExpiry,
      data.permitExpiry,
      data.insuranceExpiry,
    ].filter(Boolean);

    if (expiryDates.length === 0) return 'pending';

    const hasExpired = expiryDates.some(date => new Date(date) < now);
    if (hasExpired) return 'expired';

    const expiringSoon = expiryDates.some(date => new Date(date) < thirtyDaysFromNow);
    if (expiringSoon) return 'expiring_soon';

    return 'compliant';
  }

  private calculateNextCheckDue(data: any): Date | null {
    const expiryDates = [
      data.licenseExpiry,
      data.permitExpiry,
      data.insuranceExpiry,
    ].filter(Boolean).map(d => new Date(d));

    if (expiryDates.length === 0) return null;

    const earliestExpiry = new Date(Math.min(...expiryDates.map(d => d.getTime())));
    const checkDate = new Date(earliestExpiry);
    checkDate.setDate(checkDate.getDate() - 30); // Check 30 days before expiry

    return checkDate;
  }

  async getComplianceStats() {
    const all = await this.prisma.merchantCompliance.findMany();

    const total = all.length;
    const compliant = all.filter(c => c.status === 'compliant').length;
    const expiringSoon = all.filter(c => c.status === 'expiring_soon').length;
    const expired = all.filter(c => c.status === 'expired').length;
    const pending = all.filter(c => c.status === 'pending').length;

    return {
      total,
      compliant,
      expiringSoon,
      expired,
      pending,
      complianceRate: total > 0 ? (compliant / total) * 100 : 0,
    };
  }
}
