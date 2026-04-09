import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdjustStockDto,
  CreateWarehouseDto,
  SetStockDto,
  UpdateWarehouseDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  createWarehouse(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: {
        code: dto.code.toUpperCase(),
        name: dto.name,
        city: dto.city,
        country: dto.country,
      },
    });
  }

  listWarehouses() {
    return this.prisma.warehouse.findMany({
      include: { warehouseStocks: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  updateWarehouse(id: string, dto: UpdateWarehouseDto) {
    return this.prisma.warehouse.update({
      where: { id },
      data: dto,
    });
  }

  async setStock(dto: SetStockDto) {
    const stock = await this.prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
        },
      },
      update: { available: dto.available },
      create: {
        warehouseId: dto.warehouseId,
        productId: dto.productId,
        available: dto.available,
      },
    });
    await this.prisma.inventoryMovement.create({
      data: {
        warehouseId: dto.warehouseId,
        productId: dto.productId,
        delta: dto.available,
        reason: 'SET_STOCK',
      },
    });
    return stock;
  }

  async adjustStock(dto: AdjustStockDto) {
    const stock = await this.prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
        },
      },
      update: { available: { increment: dto.delta } },
      create: {
        warehouseId: dto.warehouseId,
        productId: dto.productId,
        available: dto.delta,
      },
    });
    await this.prisma.inventoryMovement.create({
      data: {
        warehouseId: dto.warehouseId,
        productId: dto.productId,
        delta: dto.delta,
        reason: dto.reason,
      },
    });
    return stock;
  }

  listMovements() {
    return this.prisma.inventoryMovement.findMany({
      include: { warehouse: true, product: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
