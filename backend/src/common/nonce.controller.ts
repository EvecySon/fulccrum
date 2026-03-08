import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { NonceService } from './services/nonce.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('nonce')
@UseGuards(JwtAuthGuard)
export class NonceController {
  constructor(private readonly nonceService: NonceService) {}

  /**
   * Get a nonce for a specific action.
   * Valid actions: withdraw, payment, transfer, bank-account, card-save
   */
  @Get(':action')
  async getNonce(@Request() req: any, @Param('action') action: string) {
    const validActions = ['withdraw', 'payment', 'transfer', 'bank-account', 'card-save'];

    if (!validActions.includes(action)) {
      return { error: `Invalid action. Valid: ${validActions.join(', ')}` };
    }

    const nonce = await this.nonceService.issue(req.user.sub, action);

    return {
      nonce,
      action,
      expiresIn: 300,
      message: 'Include this nonce in the X-Nonce header for your next request',
    };
  }
}
