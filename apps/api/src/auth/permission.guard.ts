import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { userId?: string; role?: string };
      requiredScope?: string;
    }>();
    if (request.user?.role?.toLowerCase() === 'admin') return true;
    const scope = request.requiredScope;
    const userId = request.user?.userId;
    if (!scope || !userId) return true;
    const grant = await this.prisma.permissionGrant.findFirst({
      where: { userId, scope },
    });
    if (!grant) {
      throw new ForbiddenException(`Missing permission scope: ${scope}`);
    }
    return true;
  }
}
