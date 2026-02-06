import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrder(customerId: string, dto: CreateOrderDto): Promise<{
        customer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        updatedAt: Date;
        businessId: string;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        deliveryFee: import("@prisma/client-runtime-utils").Decimal;
        serviceFee: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        tipAmount: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        specialInstructions: string | null;
        paymentMethod: string | null;
        driverId: string | null;
        orderNumber: string;
        placedAt: Date;
        acceptedAt: Date | null;
        preparationStartedAt: Date | null;
        readyAt: Date | null;
        pickedUpAt: Date | null;
        deliveredAt: Date | null;
        estimatedDeliveryTime: Date | null;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentId: string | null;
        customerId: string;
    }>;
    getOrder(orderId: string, userId: string, userRole: string): Promise<{
        customer: {
            id: string;
            email: string;
            phone: string | null;
            firstName: string;
            lastName: string;
        };
        driver: {
            id: string;
            phone: string | null;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        updatedAt: Date;
        businessId: string;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        deliveryFee: import("@prisma/client-runtime-utils").Decimal;
        serviceFee: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        tipAmount: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        specialInstructions: string | null;
        paymentMethod: string | null;
        driverId: string | null;
        orderNumber: string;
        placedAt: Date;
        acceptedAt: Date | null;
        preparationStartedAt: Date | null;
        readyAt: Date | null;
        pickedUpAt: Date | null;
        deliveredAt: Date | null;
        estimatedDeliveryTime: Date | null;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentId: string | null;
        customerId: string;
    }>;
    updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto, userId: string, userRole: string): Promise<{
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        driver: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        updatedAt: Date;
        businessId: string;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        deliveryFee: import("@prisma/client-runtime-utils").Decimal;
        serviceFee: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        tipAmount: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        specialInstructions: string | null;
        paymentMethod: string | null;
        driverId: string | null;
        orderNumber: string;
        placedAt: Date;
        acceptedAt: Date | null;
        preparationStartedAt: Date | null;
        readyAt: Date | null;
        pickedUpAt: Date | null;
        deliveredAt: Date | null;
        estimatedDeliveryTime: Date | null;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentId: string | null;
        customerId: string;
    }>;
    getCustomerOrders(customerId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            orderNumber: string;
            estimatedDeliveryTime: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDriverOrders(driverId: string, status?: string): Promise<({
        customer: {
            id: string;
            phone: string | null;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        updatedAt: Date;
        businessId: string;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        deliveryFee: import("@prisma/client-runtime-utils").Decimal;
        serviceFee: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        tipAmount: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        specialInstructions: string | null;
        paymentMethod: string | null;
        driverId: string | null;
        orderNumber: string;
        placedAt: Date;
        acceptedAt: Date | null;
        preparationStartedAt: Date | null;
        readyAt: Date | null;
        pickedUpAt: Date | null;
        deliveredAt: Date | null;
        estimatedDeliveryTime: Date | null;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentId: string | null;
        customerId: string;
    })[]>;
    getBusinessOrders(businessId: string, page?: number, limit?: number): Promise<{
        data: ({
            customer: {
                id: string;
                phone: string | null;
                firstName: string;
                lastName: string;
            };
            driver: {
                id: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            updatedAt: Date;
            businessId: string;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            deliveryFee: import("@prisma/client-runtime-utils").Decimal;
            serviceFee: import("@prisma/client-runtime-utils").Decimal;
            taxAmount: import("@prisma/client-runtime-utils").Decimal;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            tipAmount: import("@prisma/client-runtime-utils").Decimal;
            discountAmount: import("@prisma/client-runtime-utils").Decimal;
            specialInstructions: string | null;
            paymentMethod: string | null;
            driverId: string | null;
            orderNumber: string;
            placedAt: Date;
            acceptedAt: Date | null;
            preparationStartedAt: Date | null;
            readyAt: Date | null;
            pickedUpAt: Date | null;
            deliveredAt: Date | null;
            estimatedDeliveryTime: Date | null;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            paymentId: string | null;
            customerId: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    assignDriver(orderId: string, driverId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        updatedAt: Date;
        businessId: string;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        deliveryFee: import("@prisma/client-runtime-utils").Decimal;
        serviceFee: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        tipAmount: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        specialInstructions: string | null;
        paymentMethod: string | null;
        driverId: string | null;
        orderNumber: string;
        placedAt: Date;
        acceptedAt: Date | null;
        preparationStartedAt: Date | null;
        readyAt: Date | null;
        pickedUpAt: Date | null;
        deliveredAt: Date | null;
        estimatedDeliveryTime: Date | null;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentId: string | null;
        customerId: string;
    }>;
}
