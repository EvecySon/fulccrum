import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  async createReview(@Request() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(req.user.sub, dto);
  }

  @Get(':id')
  async getReview(@Param('id') id: string) {
    return this.reviewsService.getReview(id);
  }

  @Get('business/:businessId')
  async getBusinessReviews(
    @Param('businessId') businessId: string,
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('minRating') minRating?: string,
  ) {
    const resolvedId = businessId === 'me' ? req.user.sub : businessId;
    return this.reviewsService.getBusinessReviews(
      resolvedId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      minRating ? parseInt(minRating) : undefined,
    );
  }

  @Get('driver/:driverId')
  async getDriverReviews(
    @Param('driverId') driverId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.getDriverReviews(
      driverId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('customer/my-reviews')
  async getMyReviews(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.getCustomerReviews(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post(':id/respond')
  async respondToReview(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: RespondReviewDto,
  ) {
    return this.reviewsService.respondToReview(id, req.user.sub, dto);
  }

  @Patch(':id/helpful')
  async markHelpful(@Param('id') id: string) {
    return this.reviewsService.markHelpful(id);
  }

  @Get('business/:businessId/stats')
  async getBusinessStats(@Param('businessId') businessId: string, @Request() req: any) {
    const resolvedId = businessId === 'me' ? req.user.sub : businessId;
    return this.reviewsService.getBusinessRatingStats(resolvedId);
  }

  @Patch(':id/hide')
  async hideReview(
    @Param('id') id: string,
    @Request() req: any,
    @Body('moderationNotes') moderationNotes: string,
  ) {
    return this.reviewsService.hideReview(id, req.user.sub, moderationNotes);
  }

  @Patch(':id/unhide')
  async unhideReview(@Param('id') id: string, @Request() req: any) {
    return this.reviewsService.unhideReview(id, req.user.sub);
  }
}
