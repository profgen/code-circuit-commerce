import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReadmodelsService } from './readmodels.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('readmodels')
export class ReadmodelsController {
  constructor(private readonly readmodelsService: ReadmodelsService) {}

  @Post('admin/rebuild/orders')
  @Roles('admin')
  rebuildOrders() {
    return this.readmodelsService.rebuildOrders();
  }

  @Post('admin/rebuild/products')
  @Roles('admin')
  rebuildProducts() {
    return this.readmodelsService.rebuildProducts();
  }

  @Get('admin/orders')
  @Roles('admin')
  orderReadModels() {
    return this.readmodelsService.listOrderReadModels();
  }

  @Get('admin/products')
  @Roles('admin')
  productReadModels() {
    return this.readmodelsService.listProductReadModels();
  }
}
