import { ZonesService } from './zones.service';
export declare class ZonesController {
    private zonesService;
    constructor(zonesService: ZonesService);
    createZone(req: any, data: any): Promise<{
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
    getZone(id: string): Promise<{
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
    updateZone(id: string, data: any): Promise<{
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
    deleteZone(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    checkAvailability(data: any): Promise<{
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
    getActiveOrders(id: string): Promise<{
        zoneId: string;
        zoneName: string;
        activeOrders: number;
        maxOrders: number | null;
        capacityAvailable: boolean;
    }>;
}
