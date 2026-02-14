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

  async getVerificationRequirements(courierId: string) {
    const [user, documents, latestSelfie] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: courierId },
        select: {
          backgroundCheckStatus: true,
          backgroundCheckDate: true,
        },
      }),
      this.prisma.document.findMany({
        where: { userId: courierId },
        select: {
          type: true,
          status: true,
          expiresAt: true,
        },
      }),
      this.prisma.verificationAttempt.findFirst({
        where: { courierId, verified: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const now = new Date();
    const requirements = [];

    // Check selfie verification
    if (!latestSelfie) {
      requirements.push({
        type: 'selfie_verification',
        status: 'required',
        message: 'Initial selfie verification required',
      });
    } else {
      const daysSinceVerification = Math.floor(
        (now.getTime() - latestSelfie.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceVerification > 7) {
        requirements.push({
          type: 'selfie_verification',
          status: 'due',
          message: 'Weekly selfie verification is due',
          lastVerified: latestSelfie.createdAt,
        });
      }
    }

    // Check background check
    if (!user?.backgroundCheckStatus || user.backgroundCheckStatus === 'pending') {
      requirements.push({
        type: 'background_check',
        status: 'pending',
        message: 'Background check in progress',
      });
    } else if (user.backgroundCheckStatus === 'failed') {
      requirements.push({
        type: 'background_check',
        status: 'failed',
        message: 'Background check failed - contact support',
      });
    }

    // Check document expiration
    for (const doc of documents) {
      if (doc.status === 'verified' && doc.expiresAt) {
        const daysUntilExpiry = Math.floor(
          (doc.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysUntilExpiry < 30) {
          requirements.push({
            type: 'document_renewal',
            documentType: doc.type,
            status: daysUntilExpiry < 0 ? 'expired' : 'expiring_soon',
            message: `${doc.type} ${daysUntilExpiry < 0 ? 'has expired' : `expires in ${daysUntilExpiry} days`}`,
            expiresAt: doc.expiresAt,
          });
        }
      } else if (doc.status === 'rejected') {
        requirements.push({
          type: 'document_resubmission',
          documentType: doc.type,
          status: 'rejected',
          message: `${doc.type} was rejected - please resubmit`,
        });
      } else if (doc.status === 'uploaded') {
        requirements.push({
          type: 'document_verification',
          documentType: doc.type,
          status: 'pending',
          message: `${doc.type} is pending verification`,
        });
      }
    }

    return {
      requirements,
      allClear: requirements.length === 0,
      criticalIssues: requirements.filter(r => 
        r.status === 'required' || r.status === 'expired' || r.status === 'failed'
      ).length,
    };
  }

  async checkVerificationReminder(courierId: string): Promise<boolean> {
    const latestVerification = await this.prisma.verificationAttempt.findFirst({
      where: { courierId, verified: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestVerification) {
      return true; // Needs initial verification
    }

    const daysSinceVerification = Math.floor(
      (Date.now() - latestVerification.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    return daysSinceVerification >= 7; // Weekly verification required
  }
}
