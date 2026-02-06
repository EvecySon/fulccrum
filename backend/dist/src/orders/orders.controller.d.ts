import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    createOrder(req: any, dto: CreateOrderDto): Promise<{
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
    }>;
    getOrder(id: string, req: any): Promise<{
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
    }>;
    updateOrderStatus(id: string, dto: UpdateOrderStatusDto, req: any): Promise<{
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
    }>;
    getMyOrders(req: any, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            orderNumber: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            estimatedDeliveryTime: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDriverOrders(req: any, status?: string): Promise<({
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
    })[]>;
    getBusinessOrders(businessId: string, page?: string, limit?: string): Promise<{
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
    assignDriver(id: string, driverId: string): Promise<{
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
    }>;
}
