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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const reviews_service_1 = require("./reviews.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_review_dto_1 = require("./dto/create-review.dto");
const respond_review_dto_1 = require("./dto/respond-review.dto");
let ReviewsController = class ReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    async createReview(req, dto) {
        return this.reviewsService.createReview(req.user.sub, dto);
    }
    async getReview(id) {
        return this.reviewsService.getReview(id);
    }
    async getBusinessReviews(businessId, page, limit, minRating) {
        return this.reviewsService.getBusinessReviews(businessId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20, minRating ? parseInt(minRating) : undefined);
    }
    async getDriverReviews(driverId, page, limit) {
        return this.reviewsService.getDriverReviews(driverId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
    async getMyReviews(req, page, limit) {
        return this.reviewsService.getCustomerReviews(req.user.sub, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
    async respondToReview(id, req, dto) {
        return this.reviewsService.respondToReview(id, req.user.sub, dto);
    }
    async markHelpful(id) {
        return this.reviewsService.markHelpful(id);
    }
    async getBusinessStats(businessId) {
        return this.reviewsService.getBusinessRatingStats(businessId);
    }
    async hideReview(id, req, moderationNotes) {
        return this.reviewsService.hideReview(id, req.user.sub, moderationNotes);
    }
    async unhideReview(id, req) {
        return this.reviewsService.unhideReview(id, req.user.sub);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_review_dto_1.CreateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "createReview", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getReview", null);
__decorate([
    (0, common_1.Get)('business/:businessId'),
    __param(0, (0, common_1.Param)('businessId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('minRating')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getBusinessReviews", null);
__decorate([
    (0, common_1.Get)('driver/:driverId'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getDriverReviews", null);
__decorate([
    (0, common_1.Get)('customer/my-reviews'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getMyReviews", null);
__decorate([
    (0, common_1.Post)(':id/respond'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, respond_review_dto_1.RespondReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "respondToReview", null);
__decorate([
    (0, common_1.Patch)(':id/helpful'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "markHelpful", null);
__decorate([
    (0, common_1.Get)('business/:businessId/stats'),
    __param(0, (0, common_1.Param)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getBusinessStats", null);
__decorate([
    (0, common_1.Patch)(':id/hide'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('moderationNotes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "hideReview", null);
__decorate([
    (0, common_1.Patch)(':id/unhide'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "unhideReview", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map