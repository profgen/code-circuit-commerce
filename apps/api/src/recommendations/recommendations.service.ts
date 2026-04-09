import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  listForProduct(productId: string) {
    return this.prisma.productRecommendation.findMany({
      where: { sourceProductId: productId },
      include: { targetProduct: true },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
    });
  }

  upsert(
    sourceProductId: string,
    targetProductId: string,
    score: number,
    reason?: string,
  ) {
    return this.prisma.productRecommendation.upsert({
      where: {
        sourceProductId_targetProductId: { sourceProductId, targetProductId },
      },
      update: { score, reason },
      create: { sourceProductId, targetProductId, score, reason },
    });
  }
}
