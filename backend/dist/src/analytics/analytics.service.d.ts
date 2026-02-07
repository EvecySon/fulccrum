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
        userId: string;
        businessName: string;
        businessType: string;
        description: string | null;
        logoUrl: string | null;
        coverImageUrl: string | null;
        website: string | null;
        phone: string | null;
        email: string | null;
        taxId: string | null;
        businessLicense: string | null;
        verificationStatus: string;
        verificationDate: Date | null;
        rating: import("@prisma/client-runtime-utils").Decimal;
        averagePreparationTime: number;
        deliveryFee: import("@prisma/client-runtime-utils").Decimal;
        minimumOrderAmount: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getRevenueForecast(businessId?: string, days?: number): Promise<{
        historicalData: {
            [key: string]: number;
        };
        averageDailyRevenue: number;
        trend: string;
        trendPercentage: number;
        forecast: {
            day: number;
            predictedRevenue: number;
        }[];
    }>;
    getOrderTrends(businessId?: string, days?: number): Promise<{
        dailyOrders: {
            [key: string]: number;
        };
        averageDailyOrders: number;
        peakHour: {
            hour: number;
            orders: number;
        };
        totalOrders: number;
    }>;
    getCustomerInsights(businessId?: string): Promise<{
        totalCustomers: number;
        repeatCustomers: number;
        retentionRate: number;
        averageOrderValue: number;
    }>;
    getPredictiveAnalytics(businessId?: string): Promise<{
        revenueForecast: {
            historicalData: {
                [key: string]: number;
            };
            averageDailyRevenue: number;
            trend: string;
            trendPercentage: number;
            forecast: {
                day: number;
                predictedRevenue: number;
            }[];
        };
        orderTrends: {
            dailyOrders: {
                [key: string]: number;
            };
            averageDailyOrders: number;
            peakHour: {
                hour: number;
                orders: number;
            };
            totalOrders: number;
        };
        customerInsights: {
            totalCustomers: number;
            repeatCustomers: number;
            retentionRate: number;
            averageOrderValue: number;
        };
        recommendations: {
            type: string;
            priority: string;
            message: string;
        }[];
    }>;
    private generateRecommendations;
}
