import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SendNotificationDto } from './dto/notifications.dto';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('admin/send')
  @Roles('admin')
  send(@Body() body: SendNotificationDto) {
    return this.notificationsService.send(body);
  }

  @Get('me')
  @Roles('customer', 'seller', 'admin')
  myFeed(@CurrentUser() user: { userId: string }) {
    return this.notificationsService.listForUser(user.userId);
  }
}
