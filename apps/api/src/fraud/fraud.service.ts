import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FraudService {
  constructor(private readonly prisma: PrismaService) {}

  async assessOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) return null;

    let score = 0;
    const reasons: string[] = [];
    if (order.totalAmount > 500000) {
      score += 45;
      reasons.push('high_order_value');
    }
    if (order.storeCreditUsed > 200000) {
      score += 30;
      reasons.push('large_store_credit_usage');
    }
    if (order.discountAmount > order.totalAmount * 0.5) {
      score += 20;
      reasons.push('heavy_discount');
    }
    const level = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

    return this.prisma.fraudAssessment.create({
      data: {
        orderId,
        userId,
        score,
        level,
        reasons: reasons.join(',') || 'none',
      },
    });
  }

  queue() {
    return this.prisma.fraudAssessment.findMany({
      where: { status: 'PENDING_REVIEW' },
      orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
    });
  }

  review(id: string, approved: boolean) {
    return this.prisma.fraudAssessment.update({
      where: { id },
      data: {
        status: approved ? 'APPROVED' : 'BLOCKED',
        reviewedAt: new Date(),
      },
    });
  }
}
