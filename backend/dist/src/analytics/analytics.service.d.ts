import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(userId: string, userRole: string): Promise<{
        totalOrders: number;
        todayOrders: number;
        totalRevenue: number;
        todayRevenue: number;
        pendingOrders: number;
        rating: number;
    } | {
        totalDeliveries: number;
        todayDeliveries: number;
        totalEarnings: number;
        todayEarnings: number;
        activeOrders: number;
        rating: number;
    } | {
        totalUsers: number;
        totalOrders: number;
        todayOrders: number;
        totalRevenue: number;
        activeDrivers: number;
        activeBusinesses: number;
    } | {
        totalOrders: number;
        todayOrders: number;
        totalSpent: number;
    }>;
    private getBusinessStats;
    private getDriverStats;
    private getAdminStats;
    private getCustomerStats;
    getRevenueChart(userId: string, days?: number): Promise<{
        date: string;
        revenue: unknown;
    }[]>;
    getTopPerformers(type: 'drivers' | 'businesses', limit?: number): Promise<({
        user: {
            firstName: string;
            lastName: string;
        };
    } & {
        userId: string;
        rating: import("@prisma/client-runtime-utils").Decimal;
        vehicleType: string;
        vehicleMake: string | null;
        vehicleModel: string | null;
        vehicleYear: number | null;
        vehicleColor: string | null;
        licensePlate: string | null;
        driverLicenseNumber: string | null;
        backgroundCheckStatus: string;
        backgroundCheckDate: Date | null;
        insuranceExpiration: Date | null;
        totalDeliveries: number;
        onlineStatus: boolean;
        lastLocationUpdate: Date | null;
    })[] | ({
        user: {
            firstName: string;
            lastName: string;
        };
    } & {
        createdAt: Date;
        userId: string;
        email: string | null;
        phone: string | null;
        updatedAt: Date;
        deliveryFee: import("@prisma/client-runtime-utils").Decimal;
        businessName: string;
        businessType: string;
        description: string | null;
        logoUrl: string | null;
        coverImageUrl: string | null;
        website: string | null;
        taxId: string | null;
        businessLicense: string | null;
        verificationStatus: string;
        verificationDate: Date | null;
        rating: import("@prisma/client-runtime-utils").Decimal;
        averagePreparationTime: number;
        minimumOrderAmount: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
}
