import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blockchain')
@UseGuards(JwtAuthGuard)
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('supply-chain/:itemId')
  async getSupplyChain(@Param('itemId') itemId: string) {
    return this.blockchainService.getSupplyChain(itemId);
  }

  @Post('crypto-payment')
  async initCryptoPayment(@Request() req: any, @Body() body: { orderId: string; cryptoType: string }) {
    return this.blockchainService.initCryptoPayment(req.user.sub, body.orderId, body.cryptoType);
  }

  @Get('nft-rewards')
  async getNFTRewards(@Request() req: any) {
    return this.blockchainService.getNFTRewards(req.user.sub);
  }

  @Post('nft-rewards/:rewardId/claim')
  async claimNFT(@Request() req: any, @Param('rewardId') rewardId: string) {
    return this.blockchainService.claimNFT(req.user.sub, rewardId);
  }
}
