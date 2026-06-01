import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(private prisma: PrismaService) {}

  /**
   * Hash a token using SHA-256 before storing in the database.
   * This ensures that even if the database is compromised,
   * raw refresh tokens cannot be extracted.
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async createRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(64).toString('hex');
    const hashedToken = this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });

    // Return the raw token to the client; only the hash is stored
    return token;
  }

  async validateRefreshToken(token: string): Promise<string | null> {
    const hashedToken = this.hashToken(token);

    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!refreshToken) {
      return null;
    }

    if (new Date() > refreshToken.expiresAt) {
      await this.prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      });
      return null;
    }

    return refreshToken.userId;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const hashedToken = this.hashToken(token);
    await this.prisma.refreshToken.deleteMany({
      where: { token: hashedToken },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
