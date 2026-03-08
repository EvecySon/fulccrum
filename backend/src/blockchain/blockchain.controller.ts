import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import type { AddSupplyChainEntryDto } from './blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blockchain')
@UseGuards(JwtAuthGuard)
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // ─── Supply Chain Endpoints ────────────────────────────────────────

  @Get('supply-chain/:itemId')
  async getSupplyChain(@Param('itemId') itemId: string) {
    return this.blockchainService.getSupplyChain(itemId);
  }

  @Post('supply-chain')
  async addSupplyChainEntry(@Request() req: any, @Body() dto: AddSupplyChainEntryDto) {
    return this.blockchainService.addSupplyChainEntry(req.user.sub, dto);
  }

  @Post('supply-chain/:entryId/verify')
  async verifyEntry(@Request() req: any, @Param('entryId') entryId: string) {
    return this.blockchainService.verifyEntry(entryId, req.user.sub);
  }

  @Get('supply-chain/:itemId/integrity')
  async verifyChainIntegrity(@Param('itemId') itemId: string) {
    return this.blockchainService.verifyItemChainIntegrity(itemId);
  }

  @Get('supply-chains/business')
  async getBusinessSupplyChains(@Request() req: any) {
    return this.blockchainService.getBusinessSupplyChains(req.user.sub);
  }

  // ─── Crypto / NFT Endpoints (placeholders) ────────────────────────

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
