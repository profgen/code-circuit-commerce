import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExperimentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(key: string, description: string, variants: string, traffic = 100) {
    return this.prisma.experiment.create({
      data: { key, description, variants, traffic },
    });
  }

  list() {
    return this.prisma.experiment.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async assign(userId: string, experimentKey: string) {
    const exp = await this.prisma.experiment.findUnique({
      where: { key: experimentKey },
    });
    if (!exp || !exp.isActive) return null;
    const existing = await this.prisma.experimentAssignment.findUnique({
      where: { experimentId_userId: { experimentId: exp.id, userId } },
    });
    if (existing) return existing;
    const variants = exp.variants
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    const idx =
      Math.abs(
        [...`${exp.id}:${userId}`].reduce((sum, c) => sum + c.charCodeAt(0), 0),
      ) % variants.length;
    return this.prisma.experimentAssignment.create({
      data: { experimentId: exp.id, userId, variant: variants[idx] },
    });
  }
}
