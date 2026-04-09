import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateShipmentPackageDto,
  UpdateShipmentStatusDto,
} from './dto/logistics.dto';
import { LogisticsService } from './logistics.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Post('admin/packages')
  @Roles('admin', 'seller')
  createPackage(@Body() body: CreateShipmentPackageDto) {
    return this.logisticsService.createShipmentPackage(body);
  }

  @Patch('admin/packages/:id/status')
  @Roles('admin', 'seller')
  updatePackageStatus(
    @Param('id') packageId: string,
    @Body() body: UpdateShipmentStatusDto,
  ) {
    return this.logisticsService.updateShipmentStatus(packageId, body);
  }

  @Get('orders/:orderId/packages')
  @Roles('customer', 'seller', 'admin')
  listOrderPackages(@Param('orderId') orderId: string) {
    return this.logisticsService.listOrderPackages(orderId);
  }
}
