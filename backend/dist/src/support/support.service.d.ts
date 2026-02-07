import { PrismaService } from '../prisma/prisma.service';
export declare class SupportService {
    private prisma;
    constructor(prisma: PrismaService);
    createTicket(userId: string, data: any): Promise<{
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
    getTickets(userId: string, userRole: string, filters?: any): Promise<{
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
    getTicket(ticketId: string, userId: string, userRole: string): Promise<{
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
    addMessage(ticketId: string, userId: string, data: any): Promise<{
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
    updateTicketStatus(ticketId: string, status: string, data?: any): Promise<{
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
    assignTicket(ticketId: string, assignedToId: string): Promise<{
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
    rateTicket(ticketId: string, userId: string, rating: number): Promise<{
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
    getTicketStats(filters?: any): Promise<{
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
