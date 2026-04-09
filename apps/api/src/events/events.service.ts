import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  publish(
    aggregateType: string,
    aggregateId: string,
    eventType: string,
    payload: string,
  ) {
    return this.prisma.domainEvent.create({
      data: { aggregateType, aggregateId, eventType, payload, published: true },
    });
  }

  list(aggregateType?: string, aggregateId?: string) {
    return this.prisma.domainEvent.findMany({
      where: { aggregateType, aggregateId },
      orderBy: { occurredAt: 'desc' },
      take: 200,
    });
  }
}
