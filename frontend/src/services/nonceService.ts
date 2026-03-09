import { nonceAPI } from './api';

interface NonceCache {
  nonce: string;
  expiresAt: number;
}

/**
 * NonceService manages cryptographic nonces for sensitive operations.
 * Nonces are single-use tokens that prevent replay attacks.
 */
class NonceService {
  private cache: Map<string, NonceCache> = new Map();

  /**
   * Get a nonce for a specific action.
   * Valid actions: withdraw, payment, transfer, bank-account, card-save
   * Nonces are cached for 4 minutes (backend TTL is 5 minutes)
   */
  async getNonce(action: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(action);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`[Nonce] Using cached nonce for action: ${action}`);
      return cached.nonce;
    }

    // Fetch new nonce from backend
    console.log(`[Nonce] Fetching new nonce for action: ${action}`);
    try {
      const response = await nonceAPI.getNonce(action);
      const { nonce, expiresIn } = response.data;

      // Cache for 4 minutes (backend expires in 5)
      const cacheTime = Math.min(expiresIn - 60, 240); // 4 minutes max
      this.cache.set(action, {
        nonce,
        expiresAt: Date.now() + (cacheTime * 1000),
      });

      console.log(`[Nonce] Nonce obtained for ${action}, expires in ${cacheTime}s`);
      return nonce;
    } catch (error: any) {
      console.error(`[Nonce] Failed to get nonce for ${action}:`, error);
      throw new Error(error?.response?.data?.message || 'Failed to obtain security nonce');
    }
  }

  /**
   * Clear cached nonce for an action (call after successful use)
   */
  clearNonce(action: string): void {
    this.cache.delete(action);
    console.log(`[Nonce] Cleared nonce for action: ${action}`);
  }

  /**
   * Clear all cached nonces (call on logout)
   */
  clearAll(): void {
    this.cache.clear();
    console.log('[Nonce] Cleared all nonces');
  }

  /**
   * Check if a cached nonce exists and is valid
   */
  hasCachedNonce(action: string): boolean {
    const cached = this.cache.get(action);
    return !!(cached && cached.expiresAt > Date.now());
  }
}

export const nonceService = new NonceService();
