import { SupportService } from './support.service';
export declare class SupportController {
    private supportService;
    constructor(supportService: SupportService);
    createTicket(req: any, data: any): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        ticketNumber: string;
        category: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        attachments: import("@prisma/client/runtime/client").JsonValue;
        orderId: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        closedAt: Date | null;
        satisfactionRating: number | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedToId: string | null;
    }>;
    getTickets(req: any, filters: any): Promise<{
        data: ({
            user: {
                email: string;
                firstName: string;
                lastName: string;
            };
            assignedTo: {
                firstName: string;
                lastName: string;
            } | null;
            messages: {
                id: string;
                attachments: import("@prisma/client/runtime/client").JsonValue;
                createdAt: Date;
                ticketId: string;
                senderId: string;
                message: string;
                isInternal: boolean;
            }[];
        } & {
            id: string;
            ticketNumber: string;
            category: string;
            priority: string;
            status: string;
            subject: string;
            description: string;
            attachments: import("@prisma/client/runtime/client").JsonValue;
            orderId: string | null;
            resolution: string | null;
            resolvedAt: Date | null;
            closedAt: Date | null;
            satisfactionRating: number | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            assignedToId: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTicket(id: string, req: any): Promise<{
        user: {
            email: string;
            phone: string | null;
            firstName: string;
            lastName: string;
        };
        assignedTo: {
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        messages: ({
            sender: {
                firstName: string;
                lastName: string;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            attachments: import("@prisma/client/runtime/client").JsonValue;
            createdAt: Date;
            ticketId: string;
            senderId: string;
            message: string;
            isInternal: boolean;
        })[];
    } & {
        id: string;
        ticketNumber: string;
        category: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        attachments: import("@prisma/client/runtime/client").JsonValue;
        orderId: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        closedAt: Date | null;
        satisfactionRating: number | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedToId: string | null;
    }>;
    addMessage(id: string, req: any, data: any): Promise<{
        sender: {
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        attachments: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        ticketId: string;
        senderId: string;
        message: string;
        isInternal: boolean;
    }>;
    updateStatus(id: string, data: any): Promise<{
        id: string;
        ticketNumber: string;
        category: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        attachments: import("@prisma/client/runtime/client").JsonValue;
        orderId: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        closedAt: Date | null;
        satisfactionRating: number | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedToId: string | null;
    }>;
    assignTicket(id: string, data: any): Promise<{
        id: string;
        ticketNumber: string;
        category: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        attachments: import("@prisma/client/runtime/client").JsonValue;
        orderId: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        closedAt: Date | null;
        satisfactionRating: number | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedToId: string | null;
    }>;
    rateTicket(id: string, req: any, data: any): Promise<{
        id: string;
        ticketNumber: string;
        category: string;
        priority: string;
        status: string;
        subject: string;
        description: string;
        attachments: import("@prisma/client/runtime/client").JsonValue;
        orderId: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        closedAt: Date | null;
        satisfactionRating: number | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignedToId: string | null;
    }>;
    getStats(filters: any): Promise<{
        totalTickets: number;
        statusBreakdown: {
            open: number;
            in_progress: number;
            resolved: number;
            closed: number;
        };
        categoryBreakdown: {};
        priorityBreakdown: {};
        averageSatisfactionRating: number;
    }>;
}
