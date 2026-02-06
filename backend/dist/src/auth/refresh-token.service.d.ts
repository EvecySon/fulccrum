import { PrismaService } from '../prisma/prisma.service';
export declare class RefreshTokenService {
    private prisma;
    constructor(prisma: PrismaService);
    createRefreshToken(userId: string): Promise<string>;
    validateRefreshToken(token: string): Promise<string | null>;
    revokeRefreshToken(token: string): Promise<void>;
    revokeAllUserTokens(userId: string): Promise<void>;
    cleanupExpiredTokens(): Promise<void>;
}
