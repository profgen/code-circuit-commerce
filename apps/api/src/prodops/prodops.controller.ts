import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PlatformopsService } from '../platformops/platformops.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prodops')
export class ProdopsController {
  constructor(private readonly service: PlatformopsService) {}

  @Post('admin/catalog/import-batch')
  @Roles('admin')
  importBatch(@Body() body: { source: string; totalItems: number }) {
    return this.service.createImportBatch(body.source, body.totalItems);
  }

  @Post('admin/catalog/import-item')
  @Roles('admin')
  importItem(@Body() body: { batchId: string; payload: string }) {
    return this.service.addImportItem(body.batchId, body.payload);
  }

  @Post('admin/catalog/index-task')
  @Roles('admin')
  indexTask(
    @Body() body: { entityType: string; entityId: string; operation: string },
  ) {
    return this.service.enqueueIndexTask(
      body.entityType,
      body.entityId,
      body.operation,
    );
  }

  @Post('admin/backup')
  @Roles('admin')
  backup(
    @Body()
    body: {
      target: string;
      location: string;
      checksum: string;
      status: string;
    },
  ) {
    return this.service.createBackup(body);
  }

  @Post('admin/dr-plan')
  @Roles('admin')
  drPlan(
    @Body()
    body: {
      key: string;
      title: string;
      rtoMinutes: number;
      rpoMinutes: number;
      steps: string;
    },
  ) {
    return this.service.createDrPlan(body);
  }

  @Post('admin/loadtest')
  @Roles('admin')
  loadtest(
    @Body()
    body: {
      scenario: string;
      targetRps: number;
      p95LatencyMs: number;
      errorRate: number;
      status: string;
    },
  ) {
    return this.service.createLoadTestRun(body);
  }

  @Post('admin/release-gate')
  @Roles('admin')
  releaseGate(
    @Body() body: { name: string; criterion: string; status: string },
  ) {
    return this.service.upsertReleaseGate(body);
  }
}
