import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(req: any, dto: CreateReviewDto): Promise<{
        id: string;
        rating: number;
        foodQuality: number | null;
        serviceQuality: number | null;
        deliverySpeed: number | null;
        valueForMoney: number | null;
        comment: string | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        isVerified: boolean;
        isHidden: boolean;
        moderationNotes: string | null;
        businessResponse: string | null;
        respondedAt: Date | null;
        helpfulCount: number;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        customerId: string;
        businessId: string;
        driverId: string | null;
    }>;
    getReview(id: string): Promise<{
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
        rating: number;
        foodQuality: number | null;
        serviceQuality: number | null;
        deliverySpeed: number | null;
        valueForMoney: number | null;
        comment: string | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        isVerified: boolean;
        isHidden: boolean;
        moderationNotes: string | null;
        businessResponse: string | null;
        respondedAt: Date | null;
        helpfulCount: number;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        customerId: string;
        businessId: string;
        driverId: string | null;
    }>;
    getBusinessReviews(businessId: string, page?: string, limit?: string, minRating?: string): Promise<{
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
            rating: number;
            foodQuality: number | null;
            serviceQuality: number | null;
            deliverySpeed: number | null;
            valueForMoney: number | null;
            comment: string | null;
            images: import("@prisma/client/runtime/client").JsonValue;
            isVerified: boolean;
            isHidden: boolean;
            moderationNotes: string | null;
            businessResponse: string | null;
            respondedAt: Date | null;
            helpfulCount: number;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
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
    getDriverReviews(driverId: string, page?: string, limit?: string): Promise<{
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
            rating: number;
            foodQuality: number | null;
            serviceQuality: number | null;
            deliverySpeed: number | null;
            valueForMoney: number | null;
            comment: string | null;
            images: import("@prisma/client/runtime/client").JsonValue;
            isVerified: boolean;
            isHidden: boolean;
            moderationNotes: string | null;
            businessResponse: string | null;
            respondedAt: Date | null;
            helpfulCount: number;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
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
    getMyReviews(req: any, page?: string, limit?: string): Promise<{
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
            rating: number;
            foodQuality: number | null;
            serviceQuality: number | null;
            deliverySpeed: number | null;
            valueForMoney: number | null;
            comment: string | null;
            images: import("@prisma/client/runtime/client").JsonValue;
            isVerified: boolean;
            isHidden: boolean;
            moderationNotes: string | null;
            businessResponse: string | null;
            respondedAt: Date | null;
            helpfulCount: number;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
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
    respondToReview(id: string, req: any, dto: RespondReviewDto): Promise<{
        id: string;
        rating: number;
        foodQuality: number | null;
        serviceQuality: number | null;
        deliverySpeed: number | null;
        valueForMoney: number | null;
        comment: string | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        isVerified: boolean;
        isHidden: boolean;
        moderationNotes: string | null;
        businessResponse: string | null;
        respondedAt: Date | null;
        helpfulCount: number;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        customerId: string;
        businessId: string;
        driverId: string | null;
    }>;
    markHelpful(id: string): Promise<{
        id: string;
        rating: number;
        foodQuality: number | null;
        serviceQuality: number | null;
        deliverySpeed: number | null;
        valueForMoney: number | null;
        comment: string | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        isVerified: boolean;
        isHidden: boolean;
        moderationNotes: string | null;
        businessResponse: string | null;
        respondedAt: Date | null;
        helpfulCount: number;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        customerId: string;
        businessId: string;
        driverId: string | null;
    }>;
    getBusinessStats(businessId: string): Promise<{
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
    hideReview(id: string, req: any, moderationNotes: string): Promise<{
        id: string;
        rating: number;
        foodQuality: number | null;
        serviceQuality: number | null;
        deliverySpeed: number | null;
        valueForMoney: number | null;
        comment: string | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        isVerified: boolean;
        isHidden: boolean;
        moderationNotes: string | null;
        businessResponse: string | null;
        respondedAt: Date | null;
        helpfulCount: number;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        customerId: string;
        businessId: string;
        driverId: string | null;
    }>;
    unhideReview(id: string, req: any): Promise<{
        id: string;
        rating: number;
        foodQuality: number | null;
        serviceQuality: number | null;
        deliverySpeed: number | null;
        valueForMoney: number | null;
        comment: string | null;
        images: import("@prisma/client/runtime/client").JsonValue;
        isVerified: boolean;
        isHidden: boolean;
        moderationNotes: string | null;
        businessResponse: string | null;
        respondedAt: Date | null;
        helpfulCount: number;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        customerId: string;
        businessId: string;
        driverId: string | null;
    }>;
}
