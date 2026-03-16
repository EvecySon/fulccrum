import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, DistanceMatrixResponse } from '@googlemaps/google-maps-services-js';

interface DistanceCache {
  [key: string]: {
    distance: number;
    timestamp: number;
  };
}

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly client: Client;
  private readonly apiKey: string;
  private readonly cache: DistanceCache = {};
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private config: ConfigService) {
    this.client = new Client({});
    this.apiKey = this.config.get<string>('GOOGLE_MAPS_API_KEY') || '';
    
    if (!this.apiKey) {
      this.logger.warn('Google Maps API key not configured. Distance calculations will use Haversine formula.');
    }
  }

  /**
   * Get real road distance between two coordinates using Google Maps Distance Matrix API
   * Falls back to Haversine formula if API fails or is not configured
   */
  async getRouteDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ): Promise<{ distance: number; source: 'google_maps' | 'haversine' }> {
    // Check if API key is configured
    if (!this.apiKey) {
      const distance = this.calculateHaversineDistance(origin, destination);
      return { distance, source: 'haversine' };
    }

    // Generate cache key
    const cacheKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}`;
    
    // Check cache
    const cached = this.cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Cache hit for distance: ${cacheKey}`);
      return { distance: cached.distance, source: 'google_maps' };
    }

    try {
      // Call Google Maps Distance Matrix API
      const response: DistanceMatrixResponse = await this.client.distancematrix({
        params: {
          origins: [`${origin.lat},${origin.lng}`],
          destinations: [`${destination.lat},${destination.lng}`],
          key: this.apiKey,
          mode: 'driving',
          units: 'metric',
        },
      });

      // Extract distance from response
      const element = response.data.rows[0]?.elements[0];
      
      if (element?.status === 'OK' && element.distance) {
        const distanceInKm = element.distance.value / 1000; // Convert meters to km
        
        // Cache the result
        this.cache[cacheKey] = {
          distance: distanceInKm,
          timestamp: Date.now(),
        };

        this.logger.debug(`Google Maps distance: ${distanceInKm} km for ${cacheKey}`);
        return { distance: distanceInKm, source: 'google_maps' };
      } else {
        this.logger.warn(`Google Maps API returned status: ${element?.status}. Falling back to Haversine.`);
        const distance = this.calculateHaversineDistance(origin, destination);
        return { distance, source: 'haversine' };
      }
    } catch (error) {
      this.logger.error(`Google Maps API error: ${error.message}. Falling back to Haversine.`);
      const distance = this.calculateHaversineDistance(origin, destination);
      return { distance, source: 'haversine' };
    }
  }

  /**
   * Fallback: Calculate straight-line distance using Haversine formula
   */
  private calculateHaversineDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(destination.lat - origin.lat);
    const dLng = this.toRad(destination.lng - origin.lng);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(origin.lat)) *
        Math.cos(this.toRad(destination.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache(): void {
    Object.keys(this.cache).forEach(key => delete this.cache[key]);
    this.logger.log('Distance cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    const keys = Object.keys(this.cache);
    return { size: keys.length, keys };
  }
}
