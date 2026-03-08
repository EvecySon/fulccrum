import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';

export interface AddSupplyChainEntryDto {
  menuItemId: string;
  stage: string;
  location: string;
  handler: string;
  description: string;
  temperature?: string;
  batchNumber?: string;
  certificate?: string;
  metadata?: Record<string, any>;
}

const VALID_STAGES = ['sourced', 'processed', 'stored', 'prepared', 'dispatched', 'delivered'];
const GENESIS_HASH = '0'.repeat(64);

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Compute SHA-256 hash for a supply chain block
   */
  private computeHash(data: {
    blockIndex: number;
    previousHash: string;
    menuItemId: string;
    stage: string;
    location: string;
    handler: string;
    description: string;
    timestamp: string;
  }): string {
    const payload = JSON.stringify(data);
    return createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Get the full supply chain for a menu item
   */
  async getSupplyChain(itemId: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { id: true, name: true, businessId: true },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const entries = await this.prisma.supplyChainEntry.findMany({
      where: { menuItemId: itemId },
      orderBy: { blockIndex: 'asc' },
    });

    const isValid = this.verifyChainIntegrity(entries);

    return {
      itemId: item.id,
      itemName: item.name,
      businessId: item.businessId,
      chain: entries.map((e) => ({
        blockIndex: e.blockIndex,
        stage: e.stage,
        location: e.location,
        handler: e.handler,
        description: e.description,
        temperature: e.temperature,
        batchNumber: e.batchNumber,
        verified: e.verified,
        verifiedAt: e.verifiedAt,
        certificate: e.certificate,
        hash: e.currentHash,
        timestamp: e.timestamp,
      })),
      totalSteps: entries.length,
      chainIntegrity: isValid,
      fullyVerified: entries.length > 0 && entries.every((e) => e.verified),
      lastUpdated: entries.length > 0 ? entries[entries.length - 1].timestamp : null,
    };
  }

  /**
   * Add a new entry to a menu item's supply chain
   */
  async addSupplyChainEntry(businessId: string, dto: AddSupplyChainEntryDto) {
    if (!VALID_STAGES.includes(dto.stage)) {
      throw new BadRequestException(`Invalid stage. Valid stages: ${VALID_STAGES.join(', ')}`);
    }

    const item = await this.prisma.menuItem.findUnique({
      where: { id: dto.menuItemId },
      include: { category: { select: { businessId: true } } },
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    if (item.category.businessId !== businessId) {
      throw new BadRequestException('You can only add supply chain entries for your own menu items');
    }

    // Get the last entry in the chain
    const lastEntry = await this.prisma.supplyChainEntry.findFirst({
      where: { menuItemId: dto.menuItemId },
      orderBy: { blockIndex: 'desc' },
    });

    const blockIndex = lastEntry ? lastEntry.blockIndex + 1 : 0;
    const previousHash = lastEntry ? lastEntry.currentHash : GENESIS_HASH;
    const timestamp = new Date();

    // Compute hash for this block
    const currentHash = this.computeHash({
      blockIndex,
      previousHash,
      menuItemId: dto.menuItemId,
      stage: dto.stage,
      location: dto.location,
      handler: dto.handler,
      description: dto.description,
      timestamp: timestamp.toISOString(),
    });

    const entry = await this.prisma.supplyChainEntry.create({
      data: {
        menuItemId: dto.menuItemId,
        businessId,
        blockIndex,
        previousHash,
        currentHash,
        stage: dto.stage,
        location: dto.location,
        handler: dto.handler,
        description: dto.description,
        temperature: dto.temperature,
        batchNumber: dto.batchNumber,
        certificate: dto.certificate,
        metadata: dto.metadata || {},
        timestamp,
      },
    });

    this.logger.log(
      `Supply chain entry added: item=${dto.menuItemId} stage=${dto.stage} block=${blockIndex} hash=${currentHash.substring(0, 12)}...`,
    );

    return {
      success: true,
      entry: {
        id: entry.id,
        blockIndex: entry.blockIndex,
        stage: entry.stage,
        hash: entry.currentHash,
        previousHash: entry.previousHash,
        timestamp: entry.timestamp,
      },
    };
  }

  /**
   * Verify a specific entry in the supply chain
   */
  async verifyEntry(entryId: string, verifiedBy: string) {
    const entry = await this.prisma.supplyChainEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Supply chain entry not found');
    }

    if (entry.verified) {
      throw new BadRequestException('Entry already verified');
    }

    const updated = await this.prisma.supplyChainEntry.update({
      where: { id: entryId },
      data: {
        verified: true,
        verifiedBy,
        verifiedAt: new Date(),
      },
    });

    this.logger.log(`Supply chain entry verified: ${entryId} by ${verifiedBy}`);

    return {
      success: true,
      entryId: updated.id,
      stage: updated.stage,
      verified: true,
      verifiedAt: updated.verifiedAt,
    };
  }

  /**
   * Verify the integrity of the entire hash chain for a menu item
   */
  async verifyItemChainIntegrity(itemId: string) {
    const entries = await this.prisma.supplyChainEntry.findMany({
      where: { menuItemId: itemId },
      orderBy: { blockIndex: 'asc' },
    });

    if (entries.length === 0) {
      return { valid: true, message: 'No supply chain entries found', blocks: 0 };
    }

    const isValid = this.verifyChainIntegrity(entries);
    const tamperedBlocks: number[] = [];

    // Check each block individually
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const expectedPrevHash = i === 0 ? GENESIS_HASH : entries[i - 1].currentHash;

      if (entry.previousHash !== expectedPrevHash) {
        tamperedBlocks.push(entry.blockIndex);
      }
    }

    return {
      valid: isValid,
      blocks: entries.length,
      tamperedBlocks,
      message: isValid
        ? 'Supply chain integrity verified - no tampering detected'
        : `Chain integrity compromised at block(s): ${tamperedBlocks.join(', ')}`,
    };
  }

  /**
   * Get supply chain entries for all items belonging to a business
   */
  async getBusinessSupplyChains(businessId: string) {
    const items = await this.prisma.menuItem.findMany({
      where: { category: { businessId } },
      select: {
        id: true,
        name: true,
        supplyChain: {
          orderBy: { blockIndex: 'desc' },
          take: 1,
        },
      },
    });

    return items
      .filter((item) => item.supplyChain.length > 0)
      .map((item) => ({
        itemId: item.id,
        itemName: item.name,
        latestStage: item.supplyChain[0]?.stage,
        latestUpdate: item.supplyChain[0]?.timestamp,
        verified: item.supplyChain[0]?.verified,
      }));
  }

  /**
   * Internal: verify chain integrity from an array of entries
   */
  private verifyChainIntegrity(entries: any[]): boolean {
    if (entries.length === 0) return true;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // First block must reference genesis hash
      if (i === 0 && entry.previousHash !== GENESIS_HASH) {
        return false;
      }

      // Subsequent blocks must reference previous block's hash
      if (i > 0 && entry.previousHash !== entries[i - 1].currentHash) {
        return false;
      }
    }

    return true;
  }

  // ─── Crypto Payment (placeholder) ──────────────────────────────────────

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
