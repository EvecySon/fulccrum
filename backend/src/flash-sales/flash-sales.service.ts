import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FlashSalesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(merchantId: string) {
    const sales = await this.prisma.flashSale.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: sales };
  }

  async create(merchantId: string, data: any) {
    const sale = await this.prisma.flashSale.create({
      data: {
        merchantId,
        title: data.title,
        description: data.description || null,
        discountType: data.discountType || 'percentage',
        discountValue: parseFloat(data.discountValue),
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        maxQuantity: data.maxQuantity ? parseInt(data.maxQuantity) : null,
        isActive: true,
      },
    });
    return sale;
  }

  async update(merchantId: string, id: string, data: any) {
    const result = await this.prisma.flashSale.updateMany({
      where: { id, merchantId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.discountType && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: parseFloat(data.discountValue) }),
        ...(data.startsAt && { startsAt: new Date(data.startsAt) }),
        ...(data.endsAt && { endsAt: new Date(data.endsAt) }),
        ...(data.maxQuantity !== undefined && { maxQuantity: data.maxQuantity ? parseInt(data.maxQuantity) : null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    if (result.count === 0) throw new NotFoundException('Flash sale not found');
    return { message: 'Flash sale updated', id };
  }

  async toggle(merchantId: string, id: string) {
    const sale = await this.prisma.flashSale.findFirst({ where: { id, merchantId } });
    if (!sale) throw new NotFoundException('Flash sale not found');
    await this.prisma.flashSale.update({
      where: { id },
      data: { isActive: !sale.isActive },
    });
    return { message: 'Flash sale toggled', id, isActive: !sale.isActive };
  }

  async delete(merchantId: string, id: string) {
    const result = await this.prisma.flashSale.deleteMany({
      where: { id, merchantId },
    });
    if (result.count === 0) throw new NotFoundException('Flash sale not found');
    return { message: 'Flash sale deleted', id };
  }
}
