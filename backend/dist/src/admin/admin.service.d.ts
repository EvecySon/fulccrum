import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    private verifyAdmin;
    getAllUsers(userRole: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            email: string;
            phone: string | null;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
            status: import("@prisma/client").$Enums.UserStatus;
            lastLogin: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    suspendUser(userRole: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        phone: string | null;
        passwordHash: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        dateOfBirth: Date | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        emailVerified: boolean;
        phoneVerified: boolean;
        updatedAt: Date;
        lastLogin: Date | null;
    }>;
    activateUser(userRole: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        phone: string | null;
        passwordHash: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        dateOfBirth: Date | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        emailVerified: boolean;
        phoneVerified: boolean;
        updatedAt: Date;
        lastLogin: Date | null;
    }>;
    getAllOrders(userRole: string, page?: number, limit?: number): Promise<{
        data: ({
            customer: {
                email: string;
                firstName: string;
                lastName: string;
            };
            driver: {
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            updatedAt: Date;
            orderNumber: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            deliveryFee: import("@prisma/client-runtime-utils").Decimal;
            serviceFee: import("@prisma/client-runtime-utils").Decimal;
            taxAmount: import("@prisma/client-runtime-utils").Decimal;
            tipAmount: import("@prisma/client-runtime-utils").Decimal;
            discountAmount: import("@prisma/client-runtime-utils").Decimal;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            placedAt: Date;
            acceptedAt: Date | null;
            preparationStartedAt: Date | null;
            readyAt: Date | null;
            pickedUpAt: Date | null;
            deliveredAt: Date | null;
            estimatedDeliveryTime: Date | null;
            specialInstructions: string | null;
            paymentMethod: string | null;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            paymentId: string | null;
            customerId: string;
            businessId: string;
            driverId: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPlatformMetrics(userRole: string): Promise<{
        totalUsers: number;
        totalOrders: number;
        totalRevenue: number;
        activeDrivers: number;
        pendingWithdrawals: number;
        totalBusinesses: number;
    }>;
    getPendingWithdrawals(userRole: string, page?: number, limit?: number): Promise<{
        data: ({
            user: {
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            userId: string;
            status: import("@prisma/client").$Enums.WithdrawalStatus;
            walletId: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            confirmationCode: string | null;
            codeExpiresAt: Date | null;
            requestedAt: Date;
            confirmedAt: Date | null;
            processedAt: Date | null;
            ipAddress: string | null;
            deviceFingerprint: string | null;
            failedReason: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    approveWithdrawal(userRole: string, withdrawalId: string): Promise<{
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        walletId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        confirmationCode: string | null;
        codeExpiresAt: Date | null;
        requestedAt: Date;
        confirmedAt: Date | null;
        processedAt: Date | null;
        ipAddress: string | null;
        deviceFingerprint: string | null;
        failedReason: string | null;
    }>;
    rejectWithdrawal(userRole: string, withdrawalId: string, reason: string): Promise<{
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        walletId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        confirmationCode: string | null;
        codeExpiresAt: Date | null;
        requestedAt: Date;
        confirmedAt: Date | null;
        processedAt: Date | null;
        ipAddress: string | null;
        deviceFingerprint: string | null;
        failedReason: string | null;
    }>;
    getRecentActivity(userRole: string, limit?: number): Promise<{
        recentOrders: {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            customer: {
                firstName: string;
                lastName: string;
            };
            orderNumber: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
        }[];
        recentUsers: {
            id: string;
            createdAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        }[];
    }>;
}
