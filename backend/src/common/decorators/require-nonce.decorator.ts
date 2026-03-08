import { SetMetadata } from '@nestjs/common';
import { NONCE_ACTION_KEY } from '../guards/nonce.guard';

/**
 * Decorator to require a valid nonce for an endpoint.
 * Usage: @RequireNonce('withdraw') on a controller method.
 * The client must first call GET /nonce/:action to get a nonce,
 * then include it in the X-Nonce header when calling this endpoint.
 */
export const RequireNonce = (action: string) => SetMetadata(NONCE_ACTION_KEY, action);
