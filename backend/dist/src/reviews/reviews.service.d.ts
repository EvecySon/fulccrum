import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    createReview(customerId: string, dto: CreateReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        businessId: string;
        driverId: string | null;
        orderId: string;
        rating: number;
        images: import("@prisma/client/runtime/client").JsonValue;
        foodQuality: number | null;
        serviceQuality: number | null;
        deliverySpeed: number | null;
        valueForMoney: number | null;
        comment: string | null;
        isVerified: boolean;
        isHidden: boolean;
        moderationNotes: string | null;
        businessResponse: string | null;
        respondedAt: Date | null;
        helpfulCount: number;
    }>;
    getReview(reviewId: string): Promise<{
        order: {
            orderNumber: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            deliveredAt: Date | null;
        };
        customer: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        business: {
            userId: string;
            businessName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        businessId: string;
        driverId: string | null;
        orderId: string;
        rating: number;
        images: import("@prisma/client/runtime/client").JsonValue;
        foodQuality: number | null;
        serviceQuality: number | null;
        deliverySpeed: number | null;
        valueForMoney: number | null;
        comment: string | null;
        isVerified: boolean;
        isHidden: boolean;
        moderationNotes: string | null;
        businessResponse: string | null;
        respondedAt: Date | null;
        helpfulCount: number;
    }>;
    getBusinessReviews(businessId: string, page?: number, limit?: number, minRating?: number): Promise<{
        data: ({
            order: {
                orderNumber: string;
                deliveredAt: Date | null;
            };
            customer: {
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            businessId: string;
            driverId: string | null;
            orderId: string;
            rating: number;
            images: import("@prisma/client/runtime/client").JsonValue;
            foodQuality: number | null;
            serviceQuality: number | null;
            deliverySpeed: number | null;
            valueForMoney: number | null;
            comment: string | null;
            isVerified: boolean;
            isHidden: boolean;
            moderationNotes: string | null;
            businessResponse: string | null;
            respondedAt: Date | null;
            helpfulCount: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        stats: {
            averageRating: number;
            totalReviews: number;
            ratingDistribution: {
                5: number;
                4: number;
                3: number;
                2: number;
                1: number;
            };
            averageFoodQuality: number;
            averageServiceQuality: number;
            averageDeliverySpeed: number;
            averageValueForMoney: number;
        };
    }>;
    getDriverReviews(driverId: string, page?: number, limit?: number): Promise<{
        data: ({
            order: {
                orderNumber: string;
                deliveredAt: Date | null;
            };
            customer: {
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            businessId: string;
            driverId: string | null;
            orderId: string;
            rating: number;
            images: import("@prisma/client/runtime/client").JsonValue;
            foodQuality: number | null;
            serviceQuality: number | null;
            deliverySpeed: number | null;
            valueForMoney: number | null;
            comment: string | null;
            isVerified: boolean;
            isHidden: boolean;
            moderationNotes: string | null;
            businessResponse: string | null;
            respondedAt: Date | null;
            helpfulCount: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCustomerReviews(customerId: string, page?: number, limit?: number): Promise<{
        data: ({
            order: {
                orderNumber: string;
                totalAmount: import("@prisma/client-runtime-utils").Decimal;
                deliveredAt: Date | null;
            };
            business: {
                businessName: string;
                logoUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            businessId: string;
            driverId: string | null;
            orderId: string;
            rating: number;
            images: import("@prisma/client/runtime/client").JsonValue;
            foodQuality: number | null;
            serviceQuality: number | null;
            deliverySpeed: number | null;
            valueForMoney: number | null;
            comment: string | null;
            isVerified: boolean;
            isHidden: boolean;
            moderationNotes: string | null;
            businessResponse: string | null;
            respondedAt: Date | null;
            helpfulCount: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    respondToReview(reviewId: string, businessId: string, dto: RespondReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        businessId: string;
        driverId: string | null;
        orderId: string;
        rating: number;
        images: import("@prisma/client/runtime/client").JsonValue;
        foodQuality: number | null;
        serviceQuality: number | null;
        deliverySpeed: number | null;
        valueForMoney: number | null;
        comment: string | null;
        isVerified: boolean;
        isHidden: boolean;
        moderationNotes: string | null;
        businessResponse: string | null;
        respondedAt: Date | null;
        helpfulCount: number;
    }>;
    markHelpful(reviewId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        businessId: string;
        driverId: string | null;
        orderId: string;
        rating: number;
        images: import("@prisma/client/runtime/client").JsonValue;
        foodQuality: number | null;
        serviceQuality: number | null;
        deliverySpeed: number | null;
        valueForMoney: number | null;
        comment: string | null;
        isVerified: boolean;
        isHidden: boolean;
        moderationNotes: string | null;
        businessResponse: string | null;
        respondedAt: Date | null;
        helpfulCount: number;
    }>;
    getBusinessRatingStats(businessId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: {
            5: number;
            4: number;
            3: number;
            2: number;
            1: number;
        };
        averageFoodQuality: number;
        averageServiceQuality: number;
        averageDeliverySpeed: number;
        averageValueForMoney: number;
    }>;
    private updateBusinessRating;
    private updateDriverRating;
    hideReview(reviewId: string, adminId: string, moderationNotes: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        businessId: string;
        driverId: string | null;
        orderId: string;
        rating: number;
        images: import("@prisma/client/runtime/client").JsonValue;
        foodQuality: number | null;
        serviceQuality: number | null;
        deliverySpeed: number | null;
        valueForMoney: number | null;
        comment: string | null;
        isVerified: boolean;
        isHidden: boolean;
        moderationNotes: string | null;
        businessResponse: string | null;
        respondedAt: Date | null;
        helpfulCount: number;
    }>;
    unhideReview(reviewId: string, adminId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        businessId: string;
        driverId: string | null;
        orderId: string;
        rating: number;
        images: import("@prisma/client/runtime/client").JsonValue;
        foodQuality: number | null;
        serviceQuality: number | null;
        deliverySpeed: number | null;
        valueForMoney: number | null;
        comment: string | null;
        isVerified: boolean;
        isHidden: boolean;
        moderationNotes: string | null;
        businessResponse: string | null;
        respondedAt: Date | null;
        helpfulCount: number;
    }>;
}
