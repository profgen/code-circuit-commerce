import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsService } from './permissions.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('admin')
  @Roles('admin')
  list(@Query('userId') userId?: string) {
    return this.permissionsService.list(userId);
  }

  @Get('admin/grant')
  @Roles('admin')
  grant(
    @Query('userId') userId: string,
    @Query('scope') scope: string,
    @Query('resource') resource?: string,
    @Query('resourceId') resourceId?: string,
  ) {
    return this.permissionsService.grant(userId, scope, resource, resourceId);
  }
}
