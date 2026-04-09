import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PerfService {
  constructor(private readonly prisma: PrismaService) {}

  async precomputeHomepageFeed() {
    const products = await this.prisma.product.findMany({
      where: { status: ProductStatus.APPROVED },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
    return this.prisma.cacheEntry.upsert({
      where: { cacheKey: 'homepage:feed:v1' },
      update: {
        payload: JSON.stringify(products),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      create: {
        cacheKey: 'homepage:feed:v1',
        payload: JSON.stringify(products),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
  }

  async getHomepageFeed() {
    const cache = await this.prisma.cacheEntry.findUnique({
      where: { cacheKey: 'homepage:feed:v1' },
    });
    if (cache && cache.expiresAt.getTime() > Date.now()) {
      return JSON.parse(cache.payload);
    }
    await this.precomputeHomepageFeed();
    const refreshed = await this.prisma.cacheEntry.findUnique({
      where: { cacheKey: 'homepage:feed:v1' },
    });
    return refreshed ? JSON.parse(refreshed.payload) : [];
  }
}
