import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  RevokeSessionDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('refresh')
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke')
  revoke(
    @CurrentUser() user: { userId: string },
    @Body() body: RevokeSessionDto,
  ) {
    return this.authService.revokeSession(body.sessionId, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/rotate-all')
  rotateAll(@CurrentUser() user: { userId: string }) {
    return this.authService.rotateAllSessions(user.userId);
  }
}
