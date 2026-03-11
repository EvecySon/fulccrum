import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServicesService } from './services.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SearchProvidersDto } from './dto/search-providers.dto';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post('provider/register')
  async registerProvider(
    @Request() req: any,
    @Body() dto: CreateProviderDto,
  ) {
    const provider = await this.servicesService.registerProvider(
      req.user.id,
      dto,
    );

    return {
      success: true,
      message: 'Provider registration submitted for approval',
      data: provider,
    };
  }

  @Post('search')
  async searchProviders(@Body() dto: SearchProvidersDto) {
    const providers = await this.servicesService.searchProviders(dto);

    return {
      success: true,
      data: providers,
    };
  }

  @Get('provider/:id')
  async getProviderDetails(@Param('id') id: string) {
    const provider = await this.servicesService.getProviderDetails(id);

    return {
      success: true,
      data: provider,
    };
  }

  @Post('booking')
  async createBooking(
    @Request() req: any,
    @Body() dto: CreateBookingDto,
  ) {
    const booking = await this.servicesService.createBooking(
      req.user.id,
      dto,
    );

    return {
      success: true,
      message: 'Booking request sent to provider',
      data: booking,
    };
  }

  @Get('booking/:id')
  async getBookingStatus(@Param('id') id: string) {
    const booking = await this.servicesService.getBookingStatus(id);

    return {
      success: true,
      data: booking,
    };
  }

  @Put('booking/:id/status')
  async updateBookingStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    const booking = await this.servicesService.updateBookingStatus(
      id,
      status,
      req.user.id,
    );

    return {
      success: true,
      message: 'Booking status updated',
      data: booking,
    };
  }

  @Post('booking/:id/rate')
  async rateService(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('review') review: string,
  ) {
    await this.servicesService.rateService(id, rating, review);

    return {
      success: true,
      message: 'Thank you for your feedback!',
    };
  }

  @Get('my-bookings')
  async getMyBookings(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const bookings = await this.servicesService.getCustomerBookings(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );

    return {
      success: true,
      data: bookings,
    };
  }

  @Get('provider/bookings')
  async getProviderBookings(
    @Request() req: any,
    @Query('status') status?: string,
  ) {
    const user = await this.servicesService['prisma'].user.findUnique({
      where: { id: req.user.id },
      include: { serviceProvider: true },
    });

    if (!user?.serviceProvider) {
      return {
        success: false,
        message: 'Not registered as a service provider',
      };
    }

    const bookings = await this.servicesService.getProviderBookings(
      user.serviceProvider.id,
      status,
    );

    return {
      success: true,
      data: bookings,
    };
  }
}
