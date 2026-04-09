import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService hardening', () => {
  it('rejects refresh tokens after token version rotation', async () => {
    const prisma: {
      user: { findUnique: jest.Mock };
      authSession: { findMany: jest.Mock };
    } = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'u1',
          email: 'u1@example.com',
          role: 'CUSTOMER',
          tokenVersion: 2,
        }),
      },
      authSession: {
        findMany: jest.fn(),
      },
    };

    const jwtService: {
      verifyAsync: jest.Mock;
      signAsync: jest.Mock;
    } = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'u1',
        tokenVersion: 1,
      }),
      signAsync: jest.fn(),
    };

    const service = new AuthService(prisma as never, jwtService as never);

    await expect(service.refresh('refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.authSession.findMany).not.toHaveBeenCalled();
  });
});
