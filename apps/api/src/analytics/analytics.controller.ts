import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TrackEventDto } from './dto/analytics.dto';
import { AnalyticsService } from './analytics.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  @Roles('customer', 'seller', 'admin')
  track(@CurrentUser() user: { userId: string }, @Body() body: TrackEventDto) {
    return this.analyticsService.track(user.userId, body);
  }

  @Get('admin/summary')
  @Roles('admin')
  summary() {
    return this.analyticsService.summary();
  }
}
