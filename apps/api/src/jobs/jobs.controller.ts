import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JobsService } from './jobs.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('admin/enqueue')
  @Roles('admin')
  enqueue(@Body() body: { jobType: string; payload: string }) {
    return this.jobsService.enqueue(body.jobType, body.payload);
  }

  @Get('admin')
  @Roles('admin')
  list() {
    return this.jobsService.list();
  }

  @Post('admin/process-next')
  @Roles('admin')
  processNext() {
    return this.jobsService.processNext();
  }
}
