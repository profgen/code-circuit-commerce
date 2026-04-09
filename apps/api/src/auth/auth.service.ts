import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already exists');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash: await argon2.hash(dto.password),
      },
    });
    return this.issueTokens(user.id, user.email, user.role, user.tokenVersion);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.issueTokens(
      user.id,
      user.email,
      user.role,
      user.tokenVersion,
    );
    await this.prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: await argon2.hash(tokens.refreshToken),
      },
    });
    return tokens;
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub as string },
      });
      if (!user) throw new UnauthorizedException('Invalid refresh token');
      if ((payload.tokenVersion as number) !== user.tokenVersion) {
        throw new UnauthorizedException('Session has been rotated');
      }
      const sessions = await this.prisma.authSession.findMany({
        where: { userId: user.id, isRevoked: false },
      });
      const validSession = await Promise.any(
        sessions.map(async (s) =>
          (await argon2.verify(s.refreshTokenHash, refreshToken)) ? s : null,
        ),
      ).catch(() => null);
      if (!validSession)
        throw new UnauthorizedException('Invalid refresh session');
      return this.issueTokens(
        user.id,
        user.email,
        user.role,
        user.tokenVersion,
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeSession(sessionId: string, actorUserId: string) {
    const session = await this.prisma.authSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.userId !== actorUserId) {
      throw new UnauthorizedException('Session not found');
    }
    return this.prisma.authSession.update({
      where: { id: sessionId },
      data: { isRevoked: true, revokedAt: new Date() },
    });
  }

  async rotateAllSessions(userId: string) {
    await this.prisma.authSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true, revokedAt: new Date() },
    });
    return this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: UserRole,
    tokenVersion: number,
  ) {
    const payload = { sub: userId, email, role, tokenVersion };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as never,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as never,
    });
    return { accessToken, refreshToken };
  }
}
