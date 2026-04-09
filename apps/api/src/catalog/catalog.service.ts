import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus, SellerStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSellerProductDto,
  UpdateSellerProductDto,
} from './dto/catalog-seller.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listProducts() {
    return this.prisma.product.findMany({
      where: { status: ProductStatus.APPROVED },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  getBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug, status: ProductStatus.APPROVED },
      include: { category: true },
    });
  }

  async createSellerProduct(userId: string, dto: CreateSellerProductDto) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile || sellerProfile.status !== SellerStatus.APPROVED) {
      throw new ForbiddenException('Approved seller profile required');
    }
    return this.prisma.product.create({
      data: {
        ...dto,
        currency: dto.currency.toUpperCase(),
        status: ProductStatus.PENDING,
        moderationNote: null,
        sellerProfileId: sellerProfile.id,
      },
      include: { category: true },
    });
  }

  async updateSellerProduct(
    userId: string,
    productId: string,
    dto: UpdateSellerProductDto,
  ) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile)
      throw new ForbiddenException('Seller profile not found');
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || product.sellerProfileId !== sellerProfile.id) {
      throw new ForbiddenException('You can only update your own products');
    }
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ...dto,
        status: ProductStatus.PENDING,
        moderationNote: null,
      },
    });
  }

  async listSellerProducts(userId: string) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile)
      throw new ForbiddenException('Seller profile not found');
    return this.prisma.product.findMany({
      where: { sellerProfileId: sellerProfile.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  listProductsForModeration() {
    return this.prisma.product.findMany({
      where: { status: ProductStatus.PENDING },
      include: { category: true, sellerProfile: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.update({
      where: { id: productId },
      data: { status: ProductStatus.APPROVED, moderationNote: null },
    });
  }

  async rejectProduct(productId: string, moderationNote: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.update({
      where: { id: productId },
      data: { status: ProductStatus.REJECTED, moderationNote },
    });
  }
}
