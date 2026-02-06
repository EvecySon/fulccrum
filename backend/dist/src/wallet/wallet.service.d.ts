import { PrismaService } from '../prisma/prisma.service';
export declare class WalletService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrCreateWallet(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        frozenBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        isActive: boolean;
    }>;
    getBalance(userId: string): Promise<{
        balance: number;
        pendingBalance: number;
        frozenBalance: number;
        availableBalance: number;
        currency: string;
    }>;
    addFunds(userId: string, amount: number, description: string): Promise<{
        success: boolean;
        newBalance: number;
        message: string;
    }>;
    requestWithdrawal(userId: string, amount: number, ipAddress: string): Promise<{
        requestId: string;
        amount: number;
        expiresAt: Date | null;
        message: string;
    }>;
    confirmWithdrawal(userId: string, requestId: string, code: string): Promise<{
        success: boolean;
        amount: number;
        message: string;
    }>;
    private processWithdrawal;
    getWithdrawalHistory(userId: string, page?: number, limit?: number): Promise<{
        data: {
            amount: number;
            id: string;
            status: import("@prisma/client").$Enums.WithdrawalStatus;
            requestedAt: Date;
            confirmedAt: Date | null;
            processedAt: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    cancelWithdrawalRequest(userId: string, requestId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
