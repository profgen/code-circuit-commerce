import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { EventsService } from './events.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('admin/publish')
  @Roles('admin')
  publish(
    @Body()
    body: {
      aggregateType: string;
      aggregateId: string;
      eventType: string;
      payload: string;
    },
  ) {
    return this.eventsService.publish(
      body.aggregateType,
      body.aggregateId,
      body.eventType,
      body.payload,
    );
  }

  @Get('admin')
  @Roles('admin')
  list(
    @Query('aggregateType') aggregateType?: string,
    @Query('aggregateId') aggregateId?: string,
  ) {
    return this.eventsService.list(aggregateType, aggregateId);
  }
}
