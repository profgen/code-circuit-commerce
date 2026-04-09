import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReadmodelsService {
  constructor(private readonly prisma: PrismaService) {}

  async rebuildOrders() {
    const orders = await this.prisma.order.findMany({
      include: { items: true, shipmentEvents: true },
    });
    for (const order of orders) {
      await this.prisma.orderReadModel.upsert({
        where: { orderId: order.id },
        update: {
          userId: order.userId,
          status: order.status,
          totalAmount: order.totalAmount,
          currency: order.currency,
          itemCount: order.items.length,
          latestEvent:
            order.shipmentEvents.sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            )[0]?.status ?? null,
        },
        create: {
          orderId: order.id,
          userId: order.userId,
          status: order.status,
          totalAmount: order.totalAmount,
          currency: order.currency,
          itemCount: order.items.length,
          latestEvent:
            order.shipmentEvents.sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            )[0]?.status ?? null,
        },
      });
    }
    return { rebuilt: orders.length };
  }

  async rebuildProducts() {
    const products = await this.prisma.product.findMany({
      include: { category: true, recommendationsFrom: true },
    });
    for (const product of products) {
      await this.prisma.productReadModel.upsert({
        where: { productId: product.id },
        update: {
          title: product.title,
          status: product.status,
          categorySlug: product.category.slug,
          price: product.price,
          recommendationCount: product.recommendationsFrom.length,
        },
        create: {
          productId: product.id,
          title: product.title,
          status: product.status,
          categorySlug: product.category.slug,
          price: product.price,
          recommendationCount: product.recommendationsFrom.length,
        },
      });
    }
    return { rebuilt: products.length };
  }

  listOrderReadModels() {
    return this.prisma.orderReadModel.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  listProductReadModels() {
    return this.prisma.productReadModel.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }
}
