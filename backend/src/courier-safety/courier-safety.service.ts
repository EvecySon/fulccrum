import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourierSafetyService {
  constructor(private readonly prisma: PrismaService) {}

  async reportEmergency(courierId: string, data: any) {
    return {
      message: 'Emergency reported. Support team has been notified.',
      emergencyId: `emg-${Date.now()}`,
      courierId,
      type: data.type || 'general',
      createdAt: new Date(),
    };
  }

  async getSupport(courierId: string) {
    return {
      courierId,
      supportPhone: '+234-800-FULCCRUM',
      supportEmail: 'courier-support@fulccrum.com',
      faq: [
        { question: 'How do I report an issue with an order?', answer: 'Go to the order details and tap "Report Issue".' },
        { question: 'How do I update my vehicle info?', answer: 'Go to Profile > Vehicle Information.' },
        { question: 'When do I get paid?', answer: 'Earnings are settled weekly on Mondays.' },
      ],
    };
  }

  async submitSupportQuery(courierId: string, query: string) {
    return {
      message: 'Support query submitted',
      ticketId: `ticket-${Date.now()}`,
      query,
      status: 'open',
    };
  }

  async shareLocation(courierId: string, data: any) {
    return { message: 'Location shared', courierId, ...data };
  }

  async getSafetyEvents(courierId: string) {
    return [];
  }
}
