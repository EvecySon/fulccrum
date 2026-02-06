import { WalletService } from './wallet.service';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { ConfirmWithdrawalDto } from './dto/confirm-withdrawal.dto';
export declare class WalletController {
    private walletService;
    constructor(walletService: WalletService);
    getBalance(req: any): Promise<{
        balance: number;
        pendingBalance: number;
        frozenBalance: number;
        availableBalance: number;
        currency: string;
    }>;
    requestWithdrawal(req: any, dto: RequestWithdrawalDto, ip: string): Promise<{
        requestId: string;
        amount: number;
        expiresAt: Date | null;
        message: string;
    }>;
    confirmWithdrawal(req: any, dto: ConfirmWithdrawalDto): Promise<{
        success: boolean;
        amount: number;
        message: string;
    }>;
    getWithdrawalHistory(req: any, page?: string, limit?: string): Promise<{
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
    cancelWithdrawal(req: any, requestId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
