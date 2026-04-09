import {
  Body,
  Controller,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PlatformopsDeprecationInterceptor } from './platformops-deprecation.interceptor';
import { PlatformopsService } from './platformops.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(PlatformopsDeprecationInterceptor)
@Controller('platformops')
export class PlatformopsController {
  constructor(private readonly service: PlatformopsService) {}

  @Post('admin/trace')
  @Roles('admin')
  trace(
    @Body()
    body: {
      traceId: string;
      route: string;
      method: string;
      latencyMs: number;
      statusCode: number;
    },
  ) {
    return this.service.logTrace(
      body.traceId,
      body.route,
      body.method,
      body.latencyMs,
      body.statusCode,
    );
  }

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

  @Post('admin/apikey')
  @Roles('admin')
  apikey(
    @Body()
    body: {
      name: string;
      keyHash: string;
      ownerUserId?: string;
      scopes: string;
    },
  ) {
    return this.service.createApiKey(body);
  }

  @Post('admin/ratelimit/hit')
  @Roles('admin')
  rateLimit(@Body() body: { bucketKey: string; windowSeconds: number }) {
    return this.service.hitRateLimit(body.bucketKey, body.windowSeconds);
  }

  @Post('admin/abuse')
  @Roles('admin')
  abuse(
    @Body()
    body: {
      actorKey: string;
      signalType: string;
      score: number;
      reason?: string;
    },
  ) {
    return this.service.addAbuseSignal(body);
  }

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

  @Post('admin/reliability/checkout-attempt')
  @Roles('admin')
  checkoutAttempt(
    @Body()
    body: {
      userId: string;
      idempotencyKey: string;
      status: string;
      errorCode?: string;
    },
  ) {
    return this.service.logCheckoutAttempt(body);
  }

  @Post('admin/reliability/reconcile')
  @Roles('admin')
  reconcile(
    @Body()
    body: {
      paymentRef: string;
      orderId?: string;
      providerStatus: string;
      internalStatus: string;
      mismatch: boolean;
    },
  ) {
    return this.service.reconcilePayment(body);
  }

  @Post('admin/prod/backup')
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

  @Post('admin/prod/dr-plan')
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

  @Post('admin/prod/loadtest')
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

  @Post('admin/prod/release-gate')
  @Roles('admin')
  releaseGate(
    @Body() body: { name: string; criterion: string; status: string },
  ) {
    return this.service.upsertReleaseGate(body);
  }
}
