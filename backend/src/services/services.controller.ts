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
  Delete,
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

  @Get('categories')
  async getCategories() {
    const categories = [
      { id: 'home', name: 'Home Services', category: 'home', icon: 'home', description: 'Cleaning, plumbing, electrical & more', providerCount: 0 },
      { id: 'health', name: 'Health Services', category: 'health', icon: 'medical', description: 'Doctors, dentists, lab tests & more', providerCount: 0 },
    ];
    return { success: true, data: categories };
  }

  @Get('featured')
  async getFeaturedProviders(@Query('category') category?: string) {
    const providers = await this.servicesService.searchProviders({
      serviceType: (category === 'health' ? 'health_service' : 'home_service') as any,
    });
    return { success: true, data: providers.slice(0, 10) };
  }

  @Get('providers')
  async getProviders(
    @Query('category') category?: string,
    @Query('serviceType') serviceType?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const typeMap: Record<string, string> = { home: 'home_service', health: 'health_service' };
    const resolvedType = typeMap[category || ''] || 'home_service';
    const providers = await this.servicesService.searchProviders({
      serviceType: resolvedType as any,
      category: serviceType as any,
    });
    const p = parseInt(page || '1');
    const l = parseInt(limit || '20');
    const paged = providers.slice((p - 1) * l, p * l);
    return {
      success: true,
      data: {
        providers: paged,
        pagination: { page: p, limit: l, total: providers.length, pages: Math.ceil(providers.length / l) },
      },
    };
  }

  @Get('providers/:id')
  async getProviderById(@Param('id') id: string) {
    const provider = await this.servicesService.getProviderDetails(id);
    return { success: true, data: provider };
  }

  @Get('providers/:id/availability')
  async getProviderAvailability(
    @Param('id') id: string,
    @Query('date') date?: string,
  ) {
    const slots = [
      { id: '1', startTime: '09:00', endTime: '10:00', available: true },
      { id: '2', startTime: '10:00', endTime: '11:00', available: true },
      { id: '3', startTime: '11:00', endTime: '12:00', available: false },
      { id: '4', startTime: '14:00', endTime: '15:00', available: true },
      { id: '5', startTime: '15:00', endTime: '16:00', available: true },
      { id: '6', startTime: '16:00', endTime: '17:00', available: true },
    ];
    return { success: true, data: { date: date || new Date().toISOString().split('T')[0], slots } };
  }

  @Post('bookings')
  async createBookingAlias(
    @Request() req: any,
    @Body() dto: CreateBookingDto,
  ) {
    const booking = await this.servicesService.createBooking(req.user.id, dto);
    return { success: true, message: 'Booking request sent to provider', data: booking };
  }

  @Get('bookings')
  async getBookingsAlias(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const bookings = await this.servicesService.getCustomerBookings(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
    return { success: true, data: bookings };
  }

  @Get('bookings/:id')
  async getBookingByIdAlias(@Param('id') id: string) {
    const booking = await this.servicesService.getBookingStatus(id);
    return { success: true, data: booking };
  }

  @Post('bookings/:id/cancel')
  async cancelBooking(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const booking = await this.servicesService.updateBookingStatus(id, 'cancelled', req.user.id);
    return { success: true, message: 'Booking cancelled', data: booking };
  }

  @Post('bookings/:id/reschedule')
  async rescheduleBooking(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { date: string; timeSlotId: string },
  ) {
    const booking = await this.servicesService.getBookingStatus(id);
    return { success: true, message: 'Rescheduling not yet implemented', data: booking };
  }

  @Post('bookings/:id/rate')
  async rateBooking(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
  ) {
    await this.servicesService.rateService(id, rating, comment);
    return { success: true, message: 'Thank you for your feedback!' };
  }

  @Get('search')
  async searchProvidersGet(@Query('q') q?: string) {
    const providers = await this.servicesService.searchProviders({
      serviceType: 'home_service' as any,
    });
    const filtered = q
      ? providers.filter((p: any) => JSON.stringify(p).toLowerCase().includes(q.toLowerCase()))
      : providers;
    return { success: true, data: filtered };
  }

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
