"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SupportService = class SupportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTicket(userId, data) {
        const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        return this.prisma.supportTicket.create({
            data: {
                ticketNumber,
                userId,
                category: data.category,
                priority: data.priority || 'medium',
                subject: data.subject,
                description: data.description,
                attachments: data.attachments || [],
                orderId: data.orderId,
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }
    async getTickets(userId, userRole, filters = {}) {
        const where = {};
        if (userRole !== 'admin' && userRole !== 'support_agent') {
            where.userId = userId;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.category) {
            where.category = filters.category;
        }
        if (filters.priority) {
            where.priority = filters.priority;
        }
        if (filters.assignedToId) {
            where.assignedToId = filters.assignedToId;
        }
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const skip = (page - 1) * limit;
        const [tickets, total] = await Promise.all([
            this.prisma.supportTicket.findMany({
                where,
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    assignedTo: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.supportTicket.count({ where }),
        ]);
        return {
            data: tickets,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getTicket(ticketId, userId, userRole) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: { id: ticketId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                assignedTo: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                messages: {
                    include: {
                        sender: {
                            select: {
                                firstName: true,
                                lastName: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        if (userRole !== 'admin' && userRole !== 'support_agent' && ticket.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this ticket');
        }
        return ticket;
    }
    async addMessage(ticketId, userId, data) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: { id: ticketId },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        const message = await this.prisma.supportMessage.create({
            data: {
                ticketId,
                senderId: userId,
                message: data.message,
                attachments: data.attachments || [],
                isInternal: data.isInternal || false,
            },
            include: {
                sender: {
                    select: {
                        firstName: true,
                        lastName: true,
                        role: true,
                    },
                },
            },
        });
        if (ticket.status === 'closed') {
            await this.prisma.supportTicket.update({
                where: { id: ticketId },
                data: { status: 'open' },
            });
        }
        return message;
    }
    async updateTicketStatus(ticketId, status, data = {}) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: { id: ticketId },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        const updateData = { status };
        if (status === 'resolved') {
            updateData.resolvedAt = new Date();
            if (data.resolution) {
                updateData.resolution = data.resolution;
            }
        }
        if (status === 'closed') {
            updateData.closedAt = new Date();
        }
        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: updateData,
        });
    }
    async assignTicket(ticketId, assignedToId) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: { id: ticketId },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                assignedToId,
                status: ticket.status === 'open' ? 'in_progress' : ticket.status,
            },
        });
    }
    async rateTicket(ticketId, userId, rating) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: { id: ticketId },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        if (ticket.userId !== userId) {
            throw new common_1.ForbiddenException('You can only rate your own tickets');
        }
        if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
            throw new common_1.BadRequestException('You can only rate resolved or closed tickets');
        }
        if (rating < 1 || rating > 5) {
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        }
        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: { satisfactionRating: rating },
        });
    }
    async getTicketStats(filters = {}) {
        const where = {};
        if (filters.startDate) {
            where.createdAt = { gte: new Date(filters.startDate) };
        }
        if (filters.endDate) {
            where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) };
        }
        const [totalTickets, openTickets, inProgressTickets, resolvedTickets, closedTickets, avgRating,] = await Promise.all([
            this.prisma.supportTicket.count({ where }),
            this.prisma.supportTicket.count({ where: { ...where, status: 'open' } }),
            this.prisma.supportTicket.count({ where: { ...where, status: 'in_progress' } }),
            this.prisma.supportTicket.count({ where: { ...where, status: 'resolved' } }),
            this.prisma.supportTicket.count({ where: { ...where, status: 'closed' } }),
            this.prisma.supportTicket.aggregate({
                where: { ...where, satisfactionRating: { not: null } },
                _avg: { satisfactionRating: true },
            }),
        ]);
        const categoryBreakdown = await this.prisma.supportTicket.groupBy({
            by: ['category'],
            where,
            _count: true,
        });
        const priorityBreakdown = await this.prisma.supportTicket.groupBy({
            by: ['priority'],
            where,
            _count: true,
        });
        return {
            totalTickets,
            statusBreakdown: {
                open: openTickets,
                in_progress: inProgressTickets,
                resolved: resolvedTickets,
                closed: closedTickets,
            },
            categoryBreakdown: categoryBreakdown.reduce((acc, item) => {
                acc[item.category] = item._count;
                return acc;
            }, {}),
            priorityBreakdown: priorityBreakdown.reduce((acc, item) => {
                acc[item.priority] = item._count;
                return acc;
            }, {}),
            averageSatisfactionRating: avgRating._avg.satisfactionRating || 0,
        };
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportService);
//# sourceMappingURL=support.service.js.map