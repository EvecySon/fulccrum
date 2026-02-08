import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlockchainService {
  constructor(private readonly prisma: PrismaService) {}

  async getSupplyChain(itemId: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { id: true, name: true },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return {
      itemId: item.id,
      itemName: item.name,
      chain: [],
      verified: false,
      lastUpdated: new Date(),
    };
  }

  async initCryptoPayment(userId: string, orderId: string, cryptoType: string) {
    return {
      orderId,
      cryptoType,
      walletAddress: '',
      amount: 0,
      expiresAt: new Date(Date.now() + 30 * 60000),
      status: 'pending',
    };
  }

  async getNFTRewards(userId: string) {
    return [];
  }

  async claimNFT(userId: string, rewardId: string) {
    return { message: 'NFT reward claimed', rewardId };
  }
}
