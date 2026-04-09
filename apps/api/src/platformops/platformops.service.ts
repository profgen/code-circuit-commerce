import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlatformopsService {
  constructor(private readonly prisma: PrismaService) {}

  logTrace(
    traceId: string,
    route: string,
    method: string,
    latencyMs: number,
    statusCode: number,
  ) {
    return this.prisma.traceLog.upsert({
      where: { traceId },
      update: { route, method, latencyMs, statusCode },
      create: { traceId, route, method, latencyMs, statusCode },
    });
  }

  createSloSnapshot(data: {
    service: string;
    windowStart: string;
    windowEnd: string;
    successRate: number;
    p95LatencyMs: number;
    errorRate: number;
  }) {
    return this.prisma.sloSnapshot.create({
      data: {
        service: data.service,
        windowStart: new Date(data.windowStart),
        windowEnd: new Date(data.windowEnd),
        successRate: data.successRate,
        p95LatencyMs: data.p95LatencyMs,
        errorRate: data.errorRate,
      },
    });
  }

  createAlertRule(data: {
    name: string;
    metric: string;
    threshold: number;
    comparator: string;
  }) {
    return this.prisma.alertRule.create({ data });
  }

  createRunbook(data: {
    key: string;
    title: string;
    steps: string;
    owner: string;
  }) {
    return this.prisma.incidentRunbook.create({ data });
  }

  createIncident(data: {
    title: string;
    severity: string;
    runbookKey?: string;
  }) {
    return this.prisma.incident.create({ data });
  }

  resolveIncident(id: string) {
    return this.prisma.incident.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });
  }

  createApiKey(data: {
    name: string;
    keyHash: string;
    ownerUserId?: string;
    scopes: string;
  }) {
    return this.prisma.apiKey.create({ data });
  }

  async hitRateLimit(bucketKey: string, windowSeconds: number) {
    const now = new Date();
    const bucket = await this.prisma.rateLimitBucket.upsert({
      where: { bucketKey },
      update: { count: { increment: 1 } },
      create: { bucketKey, windowStart: now, windowSeconds, count: 1 },
    });
    return bucket;
  }

  addAbuseSignal(data: {
    actorKey: string;
    signalType: string;
    score: number;
    reason?: string;
  }) {
    return this.prisma.abuseSignal.create({ data });
  }

  createImportBatch(source: string, totalItems: number) {
    return this.prisma.catalogImportBatch.create({
      data: { source, totalItems, status: 'PENDING' },
    });
  }

  addImportItem(batchId: string, payload: string) {
    return this.prisma.catalogImportItem.create({ data: { batchId, payload } });
  }

  enqueueIndexTask(entityType: string, entityId: string, operation: string) {
    return this.prisma.searchIndexTask.create({
      data: { entityType, entityId, operation },
    });
  }

  logCheckoutAttempt(data: {
    userId: string;
    idempotencyKey: string;
    status: string;
    errorCode?: string;
  }) {
    return this.prisma.checkoutAttempt.create({ data });
  }

  reconcilePayment(data: {
    paymentRef: string;
    orderId?: string;
    providerStatus: string;
    internalStatus: string;
    mismatch: boolean;
  }) {
    return this.prisma.paymentReconciliation.upsert({
      where: { paymentRef: data.paymentRef },
      update: data,
      create: data,
    });
  }

  createBackup(data: {
    target: string;
    location: string;
    checksum: string;
    status: string;
  }) {
    return this.prisma.backupSnapshot.create({ data });
  }

  createDrPlan(data: {
    key: string;
    title: string;
    rtoMinutes: number;
    rpoMinutes: number;
    steps: string;
  }) {
    return this.prisma.disasterRecoveryPlan.create({ data });
  }

  createLoadTestRun(data: {
    scenario: string;
    targetRps: number;
    p95LatencyMs: number;
    errorRate: number;
    status: string;
  }) {
    return this.prisma.loadTestRun.create({ data });
  }

  upsertReleaseGate(data: { name: string; criterion: string; status: string }) {
    return this.prisma.releaseGate.upsert({
      where: { name: data.name },
      update: {
        criterion: data.criterion,
        status: data.status,
        checkedAt: new Date(),
      },
      create: data,
    });
  }
}
