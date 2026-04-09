import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackEventDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  track(userId: string | null, dto: TrackEventDto) {
    return this.prisma.analyticsEvent.create({
      data: {
        eventName: dto.eventName,
        userId,
        orderId: dto.orderId,
        payload: dto.payload,
      },
    });
  }

  async summary() {
    const grouped = await this.prisma.analyticsEvent.groupBy({
      by: ['eventName'],
      _count: { _all: true },
      orderBy: { _count: { eventName: 'desc' } },
    });
    return grouped.map((g) => ({
      eventName: g.eventName,
      count: g._count._all,
    }));
  }
}
