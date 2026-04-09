import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ExperimentsService } from './experiments.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('experiments')
export class ExperimentsController {
  constructor(private readonly experimentsService: ExperimentsService) {}

  @Post('admin')
  @Roles('admin')
  create(
    @Body()
    body: {
      key: string;
      description: string;
      variants: string;
      traffic?: number;
    },
  ) {
    return this.experimentsService.create(
      body.key,
      body.description,
      body.variants,
      body.traffic ?? 100,
    );
  }

  @Get('admin')
  @Roles('admin')
  list() {
    return this.experimentsService.list();
  }

  @Post('assign')
  @Roles('customer', 'seller', 'admin')
  assign(
    @CurrentUser() user: { userId: string },
    @Body() body: { experimentKey: string },
  ) {
    return this.experimentsService.assign(user.userId, body.experimentKey);
  }
}
