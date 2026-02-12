import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async searchAll(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      return { businesses: [], menuItems: [], total: 0 };
    }
    return this.searchService.searchAll(query);
  }

  @Get('businesses')
  async searchBusinesses(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      return this.searchService.listBusinesses();
    }
    return this.searchService.searchBusinesses(query);
  }

  @Get('menu-items')
  async searchMenuItems(
    @Query('q') query: string,
    @Query('businessId') businessId?: string,
  ) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.searchService.searchMenuItems(query, businessId);
  }
}
