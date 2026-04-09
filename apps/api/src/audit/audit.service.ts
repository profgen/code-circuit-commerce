import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(
    actorUserId: string | null,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: string,
  ) {
    return this.prisma.auditLog.create({
      data: { actorUserId, action, resource, resourceId, metadata },
    });
  }

  list(action?: string, resource?: string) {
    return this.prisma.auditLog.findMany({
      where: { action, resource },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }
}
