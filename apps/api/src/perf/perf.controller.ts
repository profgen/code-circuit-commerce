import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PerfService } from './perf.service';

@Controller('perf')
export class PerfController {
  constructor(private readonly perfService: PerfService) {}

  @Get('feed/homepage')
  getHomepageFeed() {
    return this.perfService.getHomepageFeed();
  }

  @Post('admin/precompute/homepage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  precomputeHomepageFeed() {
    return this.perfService.precomputeHomepageFeed();
  }
}
