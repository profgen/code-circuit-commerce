import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SellerStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApplySellerDto } from './dto/sellers.dto';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, dto: ApplySellerDto) {
    const existing = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (existing && existing.status === SellerStatus.APPROVED) {
      throw new BadRequestException('Seller profile already approved');
    }
    return this.prisma.sellerProfile.upsert({
      where: { userId },
      update: {
        businessName: dto.businessName,
        legalName: dto.legalName,
        contactNumber: dto.contactNumber,
        status: SellerStatus.PENDING,
      },
      create: {
        userId,
        businessName: dto.businessName,
        legalName: dto.legalName,
        contactNumber: dto.contactNumber,
      },
    });
  }

  listPending() {
    return this.prisma.sellerProfile.findMany({
      where: { status: SellerStatus.PENDING },
      include: { user: { select: { email: true, id: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approve(sellerProfileId: string, adminUserId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
    });
    if (!profile) throw new NotFoundException('Seller profile not found');
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: profile.userId },
        data: { role: UserRole.SELLER },
      });
      return tx.sellerProfile.update({
        where: { id: sellerProfileId },
        data: {
          status: SellerStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedByUserId: adminUserId,
        },
      });
    });
  }
}
