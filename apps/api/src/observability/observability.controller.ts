import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PlatformopsService } from '../platformops/platformops.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('observability')
export class ObservabilityController {
  constructor(private readonly service: PlatformopsService) {}

  @Post('admin/slo')
  @Roles('admin')
  slo(
    @Body()
    body: {
      service: string;
      windowStart: string;
      windowEnd: string;
      successRate: number;
      p95LatencyMs: number;
      errorRate: number;
    },
  ) {
    return this.service.createSloSnapshot(body);
  }

  @Post('admin/alert-rule')
  @Roles('admin')
  alertRule(
    @Body()
    body: {
      name: string;
      metric: string;
      threshold: number;
      comparator: string;
    },
  ) {
    return this.service.createAlertRule(body);
  }

  @Post('admin/runbook')
  @Roles('admin')
  runbook(
    @Body() body: { key: string; title: string; steps: string; owner: string },
  ) {
    return this.service.createRunbook(body);
  }

  @Post('admin/incident')
  @Roles('admin')
  incident(
    @Body() body: { title: string; severity: string; runbookKey?: string },
  ) {
    return this.service.createIncident(body);
  }

  @Patch('admin/incident/resolve')
  @Roles('admin')
  resolveIncident(@Body() body: { id: string }) {
    return this.service.resolveIncident(body.id);
  }
}
