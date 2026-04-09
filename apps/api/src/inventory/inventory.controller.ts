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
  AdjustStockDto,
  CreateWarehouseDto,
  SetStockDto,
  UpdateWarehouseDto,
} from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('admin/warehouses')
  @Roles('admin')
  createWarehouse(@Body() body: CreateWarehouseDto) {
    return this.inventoryService.createWarehouse(body);
  }

  @Get('admin/warehouses')
  @Roles('admin')
  listWarehouses() {
    return this.inventoryService.listWarehouses();
  }

  @Patch('admin/warehouses/:id')
  @Roles('admin')
  updateWarehouse(@Param('id') id: string, @Body() body: UpdateWarehouseDto) {
    return this.inventoryService.updateWarehouse(id, body);
  }

  @Post('admin/stock/set')
  @Roles('admin')
  setStock(@Body() body: SetStockDto) {
    return this.inventoryService.setStock(body);
  }

  @Post('admin/stock/adjust')
  @Roles('admin')
  adjustStock(@Body() body: AdjustStockDto) {
    return this.inventoryService.adjustStock(body);
  }

  @Get('admin/movements')
  @Roles('admin')
  listMovements() {
    return this.inventoryService.listMovements();
  }
}
