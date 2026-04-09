import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PersonalizationService {
  constructor(private readonly prisma: PrismaService) {}

  upsertProfile(
    userId: string,
    preferredCategories: string,
    priceBand?: string,
    affinityTags?: string,
  ) {
    return this.prisma.personalizationProfile.upsert({
      where: { userId },
      update: { preferredCategories, priceBand, affinityTags },
      create: { userId, preferredCategories, priceBand, affinityTags },
    });
  }

  async recommendations(userId: string) {
    const personalized = await this.prisma.personalizationScore.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { score: 'desc' },
      take: 20,
    });
    if (personalized.length > 0) return personalized;

    const profile = await this.prisma.personalizationProfile.findUnique({
      where: { userId },
    });
    if (!profile) return [];
    const categories = profile.preferredCategories
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    return this.prisma.product.findMany({
      where: { category: { slug: { in: categories } } },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
  }
}
