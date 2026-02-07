import { PrismaService } from '../prisma/prisma.service';
export declare class ZonesService {
    private prisma;
    constructor(prisma: PrismaService);
    private isPointInPolygon;
    createZone(businessId: string, data: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        coordinates: import("@prisma/client/runtime/client").JsonValue;
        deliveryFee: import("@prisma/client-runtime-utils").Decimal | null;
        minimumOrder: import("@prisma/client-runtime-utils").Decimal | null;
        isActive: boolean;
        maxOrders: number | null;
        estimatedDeliveryTime: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
    }>;
    getBusinessZones(businessId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        coordinates: import("@prisma/client/runtime/client").JsonValue;
        deliveryFee: import("@prisma/client-runtime-utils").Decimal | null;
        minimumOrder: import("@prisma/client-runtime-utils").Decimal | null;
        isActive: boolean;
        maxOrders: number | null;
        estimatedDeliveryTime: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
    }[]>;
    getZone(zoneId: string): Promise<{
        business: {
            businessName: string;
            businessType: string;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        coordinates: import("@prisma/client/runtime/client").JsonValue;
        deliveryFee: import("@prisma/client-runtime-utils").Decimal | null;
        minimumOrder: import("@prisma/client-runtime-utils").Decimal | null;
        isActive: boolean;
        maxOrders: number | null;
        estimatedDeliveryTime: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
    }>;
    updateZone(zoneId: string, data: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        coordinates: import("@prisma/client/runtime/client").JsonValue;
        deliveryFee: import("@prisma/client-runtime-utils").Decimal | null;
        minimumOrder: import("@prisma/client-runtime-utils").Decimal | null;
        isActive: boolean;
        maxOrders: number | null;
        estimatedDeliveryTime: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
    }>;
    deleteZone(zoneId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    checkDeliveryAvailability(businessId: string, latitude: number, longitude: number): Promise<{
        available: boolean;
        zone: {
            id: string;
            name: string;
            deliveryFee: import("@prisma/client-runtime-utils").Decimal | null;
            minimumOrder: import("@prisma/client-runtime-utils").Decimal | null;
            estimatedDeliveryTime: number;
        };
        message?: undefined;
    } | {
        available: boolean;
        message: string;
        zone?: undefined;
    }>;
    getActiveOrdersInZone(zoneId: string): Promise<{
        zoneId: string;
        zoneName: string;
        activeOrders: number;
        maxOrders: number | null;
        capacityAvailable: boolean;
    }>;
}
