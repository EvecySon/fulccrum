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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReview(customerId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { review: true },
        });
        if (!order) {
            throw new common_1.BadRequestException('Order not found');
        }
        if (order.customerId !== customerId) {
            throw new common_1.ForbiddenException('You can only review your own orders');
        }
        if (order.status !== 'delivered') {
            throw new common_1.BadRequestException('You can only review delivered orders');
        }
        if (order.review) {
            throw new common_1.BadRequestException('You have already reviewed this order');
        }
        const review = await this.prisma.review.create({
            data: {
                orderId: dto.orderId,
                customerId,
                businessId: order.businessId,
                driverId: order.driverId,
                rating: dto.rating,
                foodQuality: dto.foodQuality,
                serviceQuality: dto.serviceQuality,
                deliverySpeed: dto.deliverySpeed,
                valueForMoney: dto.valueForMoney,
                comment: dto.comment,
                images: dto.images || [],
                isVerified: true,
            },
        });
        await this.updateBusinessRating(order.businessId);
        if (order.driverId) {
            await this.updateDriverRating(order.driverId);
        }
        return review;
    }
    async getReview(reviewId) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
                business: {
                    select: {
                        userId: true,
                        businessName: true,
                    },
                },
                order: {
                    select: {
                        orderNumber: true,
                        totalAmount: true,
                        deliveredAt: true,
                    },
                },
            },
        });
        if (!review) {
            throw new common_1.BadRequestException('Review not found');
        }
        if (review.isHidden) {
            throw new common_1.BadRequestException('Review is not available');
        }
        return review;
    }
    async getBusinessReviews(businessId, page = 1, limit = 20, minRating) {
        const skip = (page - 1) * limit;
        const where = {
            businessId,
            isHidden: false,
            ...(minRating ? { rating: { gte: minRating } } : {}),
        };
        const [reviews, total, stats] = await Promise.all([
            this.prisma.review.findMany({
                where,
                include: {
                    customer: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatarUrl: true,
                        },
                    },
                    order: {
                        select: {
                            orderNumber: true,
                            deliveredAt: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.review.count({ where }),
            this.getBusinessRatingStats(businessId),
        ]);
        return {
            data: reviews,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats,
        };
    }
    async getDriverReviews(driverId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where: {
                    driverId,
                    isHidden: false,
                },
                include: {
                    customer: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatarUrl: true,
                        },
                    },
                    order: {
                        select: {
                            orderNumber: true,
                            deliveredAt: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.review.count({ where: { driverId, isHidden: false } }),
        ]);
        return {
            data: reviews,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getCustomerReviews(customerId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { customerId },
                include: {
                    business: {
                        select: {
                            businessName: true,
                            logoUrl: true,
                        },
                    },
                    order: {
                        select: {
                            orderNumber: true,
                            totalAmount: true,
                            deliveredAt: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.review.count({ where: { customerId } }),
        ]);
        return {
            data: reviews,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async respondToReview(reviewId, businessId, dto) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.BadRequestException('Review not found');
        }
        if (review.businessId !== businessId) {
            throw new common_1.ForbiddenException('You can only respond to reviews for your business');
        }
        return this.prisma.review.update({
            where: { id: reviewId },
            data: {
                businessResponse: dto.businessResponse,
                respondedAt: new Date(),
            },
        });
    }
    async markHelpful(reviewId) {
        return this.prisma.review.update({
            where: { id: reviewId },
            data: {
                helpfulCount: {
                    increment: 1,
                },
            },
        });
    }
    async getBusinessRatingStats(businessId) {
        const reviews = await this.prisma.review.findMany({
            where: {
                businessId,
                isHidden: false,
            },
            select: {
                rating: true,
                foodQuality: true,
                serviceQuality: true,
                deliverySpeed: true,
                valueForMoney: true,
            },
        });
        if (reviews.length === 0) {
            return {
                averageRating: 5.0,
                totalReviews: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                averageFoodQuality: 0,
                averageServiceQuality: 0,
                averageDeliverySpeed: 0,
                averageValueForMoney: 0,
            };
        }
        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
        const ratingDistribution = reviews.reduce((acc, r) => {
            acc[r.rating] = (acc[r.rating] || 0) + 1;
            return acc;
        }, {});
        const foodQualityReviews = reviews.filter((r) => r.foodQuality !== null);
        const serviceQualityReviews = reviews.filter((r) => r.serviceQuality !== null);
        const deliverySpeedReviews = reviews.filter((r) => r.deliverySpeed !== null);
        const valueForMoneyReviews = reviews.filter((r) => r.valueForMoney !== null);
        return {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            ratingDistribution: {
                5: ratingDistribution[5] || 0,
                4: ratingDistribution[4] || 0,
                3: ratingDistribution[3] || 0,
                2: ratingDistribution[2] || 0,
                1: ratingDistribution[1] || 0,
            },
            averageFoodQuality: foodQualityReviews.length > 0
                ? Math.round((foodQualityReviews.reduce((sum, r) => sum + (r.foodQuality || 0), 0) /
                    foodQualityReviews.length) *
                    10) / 10
                : 0,
            averageServiceQuality: serviceQualityReviews.length > 0
                ? Math.round((serviceQualityReviews.reduce((sum, r) => sum + (r.serviceQuality || 0), 0) /
                    serviceQualityReviews.length) *
                    10) / 10
                : 0,
            averageDeliverySpeed: deliverySpeedReviews.length > 0
                ? Math.round((deliverySpeedReviews.reduce((sum, r) => sum + (r.deliverySpeed || 0), 0) /
                    deliverySpeedReviews.length) *
                    10) / 10
                : 0,
            averageValueForMoney: valueForMoneyReviews.length > 0
                ? Math.round((valueForMoneyReviews.reduce((sum, r) => sum + (r.valueForMoney || 0), 0) /
                    valueForMoneyReviews.length) *
                    10) / 10
                : 0,
        };
    }
    async updateBusinessRating(businessId) {
        const stats = await this.getBusinessRatingStats(businessId);
        await this.prisma.businessProfile.update({
            where: { userId: businessId },
            data: { rating: stats.averageRating },
        });
    }
    async updateDriverRating(driverId) {
        const reviews = await this.prisma.review.findMany({
            where: {
                driverId,
                isHidden: false,
            },
            select: { deliverySpeed: true },
        });
        if (reviews.length === 0)
            return;
        const validReviews = reviews.filter((r) => r.deliverySpeed !== null);
        if (validReviews.length === 0)
            return;
        const averageRating = validReviews.reduce((sum, r) => sum + (r.deliverySpeed || 0), 0) / validReviews.length;
        await this.prisma.driverProfile.update({
            where: { userId: driverId },
            data: { rating: Math.round(averageRating * 10) / 10 },
        });
    }
    async hideReview(reviewId, adminId, moderationNotes) {
        return this.prisma.review.update({
            where: { id: reviewId },
            data: {
                isHidden: true,
                moderationNotes,
            },
        });
    }
    async unhideReview(reviewId, adminId) {
        return this.prisma.review.update({
            where: { id: reviewId },
            data: {
                isHidden: false,
            },
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map