import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  enqueue(jobType: string, payload: string) {
    return this.prisma.jobQueue.create({
      data: { jobType, payload },
    });
  }

  list() {
    return this.prisma.jobQueue.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async processNext() {
    const job = await this.prisma.jobQueue.findFirst({
      where: {
        status: 'QUEUED',
        OR: [{ nextRunAt: null }, { nextRunAt: { lte: new Date() } }],
      },
      orderBy: { runAt: 'asc' },
    });
    if (!job) return null;
    const shouldFail = job.payload.includes('"forceFail":true');
    const nextAttempts = job.attempts + 1;
    if (shouldFail && nextAttempts < 5) {
      const backoffMinutes = Math.pow(2, nextAttempts);
      return this.prisma.jobQueue.update({
        where: { id: job.id },
        data: {
          attempts: nextAttempts,
          status: 'QUEUED',
          lastError: `Simulated failure attempt ${nextAttempts}`,
          nextRunAt: new Date(Date.now() + backoffMinutes * 60 * 1000),
        },
      });
    }
    return this.prisma.jobQueue.update({
      where: { id: job.id },
      data: {
        status: shouldFail ? 'FAILED' : 'DONE',
        attempts: nextAttempts,
        processedAt: new Date(),
        lastError: shouldFail ? 'Exceeded retry limit' : null,
      },
    });
  }
}
