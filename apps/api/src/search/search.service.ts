import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string) {
    const q = query.toLowerCase();
    const products = await this.prisma.product.findMany({
      where: { status: ProductStatus.APPROVED },
      include: { searchMetric: true },
    });
    return products
      .map((p) => {
        const titleScore = p.title.toLowerCase().includes(q) ? 5 : 0;
        const descScore = p.description.toLowerCase().includes(q) ? 2 : 0;
        const popularity =
          (p.searchMetric?.clicks ?? 0) * 0.2 +
          (p.searchMetric?.orders ?? 0) * 0.5;
        return { ...p, score: titleScore + descScore + popularity };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score);
  }
}
