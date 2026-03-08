import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NonceService } from '../services/nonce.service';

export const NONCE_ACTION_KEY = 'nonce_action';

@Injectable()
export class NonceGuard implements CanActivate {
  constructor(
    private readonly nonceService: NonceService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.get<string>(NONCE_ACTION_KEY, context.getHandler());
    if (!action) return true;

    const request = context.switchToHttp().getRequest();
    const nonce = request.headers['x-nonce'] || request.body?.nonce;
    const userId = request.user?.sub;

    if (!userId) {
      throw new BadRequestException('Authentication required');
    }

    if (!nonce) {
      throw new BadRequestException('X-Nonce header is required for this operation');
    }

    await this.nonceService.validate(nonce, userId, action);
    return true;
  }
}
