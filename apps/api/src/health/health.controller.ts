import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHealth() {
    return { status: 'ok', service: 'api' };
  }

  @Get('ready')
  async getReadiness() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ready', service: 'api', db: 'up' };
  }
}
