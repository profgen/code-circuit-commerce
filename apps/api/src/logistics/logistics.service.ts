import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateShipmentPackageDto,
  UpdateShipmentStatusDto,
} from './dto/logistics.dto';

@Injectable()
export class LogisticsService {
  constructor(private readonly prisma: PrismaService) {}

  createShipmentPackage(dto: CreateShipmentPackageDto) {
    return this.prisma.shipmentPackage.create({
      data: {
        orderId: dto.orderId,
        warehouseId: dto.warehouseId,
        trackingNumber: dto.trackingNumber,
        carrier: dto.carrier,
        eta: dto.eta ? new Date(dto.eta) : null,
        status: 'CREATED',
      },
    });
  }

  async updateShipmentStatus(packageId: string, dto: UpdateShipmentStatusDto) {
    const shipment = await this.prisma.shipmentPackage.findUnique({
      where: { id: packageId },
    });
    if (!shipment) throw new NotFoundException('Shipment package not found');
    await this.prisma.shipmentEvent.create({
      data: {
        orderId: shipment.orderId,
        status: dto.status,
        location: shipment.carrier ?? 'N/A',
        note: `Package ${shipment.trackingNumber}`,
        createdByUserId: 'system',
      },
    });
    return this.prisma.shipmentPackage.update({
      where: { id: packageId },
      data: {
        status: dto.status,
        eta: dto.eta ? new Date(dto.eta) : shipment.eta,
      },
    });
  }

  listOrderPackages(orderId: string) {
    return this.prisma.shipmentPackage.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
