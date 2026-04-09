import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async getCart(userId: string) {
    await this.ensureCart(userId);
    return this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new BadRequestException('Product not found');
    if (product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }
    const cart = await this.ensureCart(userId);
    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId: dto.productId },
      },
      update: { quantity: dto.quantity },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.ensureCart(userId);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
    return this.getCart(userId);
  }
}
