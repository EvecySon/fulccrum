import { PrismaService } from '../prisma/prisma.service';
import { UpdateLocationDto } from './dto/update-location.dto';
export declare class LocationService {
    private prisma;
    constructor(prisma: PrismaService);
    updateDriverLocation(driverId: string, dto: UpdateLocationDto): Promise<{
        id: string;
        driverId: string;
        latitude: import("@prisma/client-runtime-utils").Decimal;
        longitude: import("@prisma/client-runtime-utils").Decimal;
        accuracy: number | null;
        heading: number | null;
        speed: number | null;
        timestamp: Date;
    }>;
    getDriverLocation(driverId: string): Promise<{
        id: string;
        driverId: string;
        latitude: import("@prisma/client-runtime-utils").Decimal;
        longitude: import("@prisma/client-runtime-utils").Decimal;
        accuracy: number | null;
        heading: number | null;
        speed: number | null;
        timestamp: Date;
    }>;
    getDriverLocationHistory(driverId: string, hours?: number): Promise<{
        id: string;
        driverId: string;
        latitude: import("@prisma/client-runtime-utils").Decimal;
        longitude: import("@prisma/client-runtime-utils").Decimal;
        accuracy: number | null;
        heading: number | null;
        speed: number | null;
        timestamp: Date;
    }[]>;
    getNearbyDrivers(latitude: number, longitude: number, radiusKm?: number): Promise<{
        driver: {
            id: string;
            name: string;
            phone: string | null;
            rating: number;
            vehicleType: string;
        };
        location: {
            latitude: number;
            longitude: number;
            accuracy: number | null;
            timestamp: Date;
        };
        distance: number;
    }[]>;
    trackOrderDelivery(orderId: string): Promise<{
        order: {
            id: string;
            orderNumber: string;
            status: import("@prisma/client").$Enums.OrderStatus;
        };
        driver: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        location: {
            latitude: number;
            longitude: number;
            accuracy: number | null;
            heading: number | null;
            speed: number | null;
            timestamp: Date;
        };
    }>;
    setDriverOnlineStatus(driverId: string, isOnline: boolean): Promise<{
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
    }>;
    private calculateDistance;
    private toRadians;
    cleanupOldLocations(daysToKeep?: number): Promise<{
        deleted: number;
        message: string;
    }>;
}
