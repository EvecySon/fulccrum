import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../../upload/upload.service';

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async submitSelfie(courierId: string, file: Express.Multer.File, reason: string = 'periodic') {
    if (!file) {
      throw new BadRequestException('Selfie photo is required');
    }

    // Upload selfie to storage
    const uploadResult = await this.uploadService.uploadFile(file, 'verification-selfies');

    // Simple verification logic - in production, this would use face matching API
    // For now, we'll simulate verification with a random confidence score
    const confidence = 0.7 + Math.random() * 0.3; // 70-100%
    const verified = confidence >= 0.75;

    // Store verification attempt
    await this.prisma.verificationAttempt.create({
      data: {
        courierId,
        photoUrl: uploadResult.url,
        verified,
        confidence,
        reason,
      },
    });

    return {
      verified,
      confidence: Math.round(confidence * 100) / 100,
      message: verified 
        ? 'Identity verified successfully'
        : 'Could not match your selfie. Please try again.',
    };
  }

  async getStatus(courierId: string) {
    const latestVerification = await this.prisma.verificationAttempt.findFirst({
      where: {
        courierId,
        verified: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attemptsToday = await this.prisma.verificationAttempt.count({
      where: {
        courierId,
        createdAt: { gte: today },
      },
    });

    let nextVerificationDue: Date | null = null;
    if (latestVerification) {
      nextVerificationDue = new Date(latestVerification.createdAt);
      nextVerificationDue.setDate(nextVerificationDue.getDate() + 7); // Weekly verification
    }

    return {
      verified: !!latestVerification,
      lastVerifiedAt: latestVerification?.createdAt.toISOString() || null,
      nextVerificationDue: nextVerificationDue?.toISOString() || null,
      attemptsToday,
    };
  }

  async getHistory(courierId: string) {
    const attempts = await this.prisma.verificationAttempt.findMany({
      where: { courierId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return attempts.map(attempt => ({
      id: attempt.id,
      timestamp: attempt.createdAt.toISOString(),
      verified: attempt.verified,
      confidence: Math.round(attempt.confidence * 100) / 100,
      reason: attempt.reason || 'periodic',
    }));
  }
}
