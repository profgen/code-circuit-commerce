import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  grant(userId: string, scope: string, resource?: string, resourceId?: string) {
    return this.prisma.permissionGrant.create({
      data: { userId, scope, resource, resourceId },
    });
  }

  list(userId?: string) {
    return this.prisma.permissionGrant.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
