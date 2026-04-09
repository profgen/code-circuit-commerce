import { JobsService } from './jobs.service';

describe('JobsService retry/backoff', () => {
  it('requeues failing job with exponential backoff before final failure', async () => {
    const prisma: {
      jobQueue: {
        findFirst: jest.Mock;
        update: jest.Mock;
      };
    } = {
      jobQueue: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'job-1',
          payload: '{"forceFail":true}',
          attempts: 1,
          runAt: new Date(),
        }),
        update: jest.fn().mockResolvedValue({ id: 'job-1', status: 'QUEUED' }),
      },
    };

    const service = new JobsService(prisma as never);
    await service.processNext();

    expect(prisma.jobQueue.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-1' },
        data: expect.objectContaining({
          attempts: 2,
          status: 'QUEUED',
          lastError: 'Simulated failure attempt 2',
          nextRunAt: expect.any(Date),
        }),
      }),
    );
  });
});
