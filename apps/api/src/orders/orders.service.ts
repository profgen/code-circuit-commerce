import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  RefundStatus,
  ReservationStatus,
  ReturnStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  listByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true, refunds: true, shipmentEvents: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForSeller(userId: string) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile)
      throw new ForbiddenException('Seller profile not found');
    return this.prisma.order.findMany({
      where: {
        items: { some: { product: { sellerProfileId: sellerProfile.id } } },
      },
      include: { items: true, refunds: true, shipmentEvents: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async transitionForSeller(
    userId: string,
    orderId: string,
    target: OrderStatus,
  ) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile)
      throw new ForbiddenException('Seller profile not found');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');

    const ownsAnyItem = order.items.some(
      (item) => item.product.sellerProfileId === sellerProfile.id,
    );
    if (!ownsAnyItem)
      throw new ForbiddenException('Order does not belong to your store');

    const allowed: Record<OrderStatus, OrderStatus | null> = {
      DRAFT: null,
      PENDING_PAYMENT: null,
      PAID: OrderStatus.ACCEPTED,
      ACCEPTED: OrderStatus.PACKED,
      PACKED: OrderStatus.SHIPPED,
      SHIPPED: OrderStatus.DELIVERED,
      DELIVERED: null,
      REFUND_PENDING: null,
      REFUNDED: null,
      DISPUTED: null,
      FAILED: null,
      CANCELLED: null,
    };
    if (allowed[order.status] !== target) {
      throw new ForbiddenException(
        `Invalid status transition from ${order.status} to ${target}`,
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: target },
      include: { items: true, refunds: true, shipmentEvents: true },
    });
  }

  async addShipmentEvent(
    userId: string,
    orderId: string,
    status: string,
    location: string,
    note: string,
  ) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile)
      throw new ForbiddenException('Seller profile not found');
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    const ownsAnyItem = order.items.some(
      (item) => item.product.sellerProfileId === sellerProfile.id,
    );
    if (!ownsAnyItem)
      throw new ForbiddenException('Order does not belong to your store');
    return this.prisma.shipmentEvent.create({
      data: { orderId, status, location, note, createdByUserId: userId },
    });
  }

  async getTrackingTimeline(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shipmentEvents: { orderBy: { createdAt: 'asc' } },
        user: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) {
      throw new ForbiddenException(
        'You can only view tracking for your own orders',
      );
    }
    return order.shipmentEvents;
  }

  async markDelivered(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.SHIPPED) {
      throw new ForbiddenException(
        'Only shipped orders can be marked delivered',
      );
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.DELIVERED },
        include: { items: { include: { product: true } } },
      });

      const payoutBySeller = new Map<string, number>();
      for (const item of updated.items) {
        const sellerProfileId = item.product.sellerProfileId;
        if (!sellerProfileId) continue;
        const gross = item.snapshotPrice * item.quantity;
        payoutBySeller.set(
          sellerProfileId,
          (payoutBySeller.get(sellerProfileId) ?? 0) + gross,
        );
      }

      for (const [sellerProfileId, grossAmount] of payoutBySeller.entries()) {
        const commissionAmount = Math.floor(grossAmount * 0.1);
        const netAmount = grossAmount - commissionAmount;
        await tx.sellerPayoutEntry.create({
          data: {
            sellerProfileId,
            orderId,
            grossAmount,
            commissionAmount,
            netAmount,
          },
        });
      }

      return updated;
    });
  }

  async createReturnRequest(userId: string, orderId: string, reason: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) {
      throw new ForbiddenException('You can only return your own orders');
    }
    if (order.status !== OrderStatus.DELIVERED) {
      throw new ForbiddenException('Only delivered orders can be returned');
    }
    const returnWindowMs = 7 * 24 * 3600 * 1000;
    if (Date.now() - order.updatedAt.getTime() > returnWindowMs) {
      throw new ForbiddenException('Return window expired');
    }

    return this.prisma.returnRequest.create({
      data: {
        orderId,
        userId,
        reason,
      },
    });
  }

  listOpenReturns() {
    return this.prisma.returnRequest.findMany({
      where: { status: ReturnStatus.REQUESTED },
      include: { order: true, user: { select: { id: true, email: true } } },
      orderBy: { requestedAt: 'asc' },
    });
  }

  async resolveReturnRequest(
    returnId: string,
    approve: boolean,
    adminNote: string,
  ) {
    const req = await this.prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: { order: { include: { items: true } } },
    });
    if (!req) throw new NotFoundException('Return request not found');

    return this.prisma.$transaction(async (tx) => {
      const resolved = await tx.returnRequest.update({
        where: { id: returnId },
        data: {
          status: approve ? ReturnStatus.APPROVED : ReturnStatus.REJECTED,
          adminNote,
          resolvedAt: new Date(),
        },
      });

      if (approve) {
        for (const item of req.order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        await tx.user.update({
          where: { id: req.userId },
          data: { walletBalance: { increment: req.order.totalAmount } },
        });
        await tx.walletTransaction.create({
          data: {
            userId: req.userId,
            orderId: req.orderId,
            type: 'CREDIT',
            amount: req.order.totalAmount,
            description: 'Return refund to wallet',
          },
        });

        await tx.order.update({
          where: { id: req.orderId },
          data: { status: OrderStatus.REFUNDED },
        });
        await tx.settlementEntry.updateMany({
          where: { orderId: req.orderId, status: 'POSTED' },
          data: { status: 'REVERSED', reference: 'return_approved' },
        });
      }

      return resolved;
    });
  }

  async listSellerPayouts(userId: string) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile)
      throw new ForbiddenException('Seller profile not found');
    return this.prisma.sellerPayoutEntry.findMany({
      where: { sellerProfileId: sellerProfile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markPayoutPaid(payoutId: string) {
    return this.prisma.sellerPayoutEntry.update({
      where: { id: payoutId },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }

  listSettlementEntries() {
    return this.prisma.settlementEntry.findMany({
      include: { order: true, sellerProfile: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportSettlementCsv() {
    const entries = await this.prisma.settlementEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const header =
      'id,orderId,sellerProfileId,type,grossAmount,commissionAmount,netAmount,currency,status,reference,createdAt';
    const lines = entries.map((e) =>
      [
        e.id,
        e.orderId,
        e.sellerProfileId ?? '',
        e.type,
        e.grossAmount,
        e.commissionAmount,
        e.netAmount,
        e.currency,
        e.status,
        e.reference ?? '',
        e.createdAt.toISOString(),
      ].join(','),
    );
    return [header, ...lines].join('\n');
  }

  async cancelOrder(userId: string, orderId: string, reason: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, reservations: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    const cancellable: OrderStatus[] = [
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAID,
      OrderStatus.ACCEPTED,
    ];
    if (!cancellable.includes(order.status)) {
      throw new ForbiddenException('Order is no longer cancellable');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.inventoryReservation.updateMany({
        where: { orderId },
        data: { status: ReservationStatus.RELEASED },
      });

      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        const refundCredit = order.totalAmount + order.storeCreditUsed;
        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { increment: refundCredit } },
        });
        await tx.walletTransaction.create({
          data: {
            userId,
            orderId,
            type: 'CREDIT',
            amount: refundCredit,
            description: 'Order cancellation refund',
          },
        });
        await tx.settlementEntry.updateMany({
          where: { orderId, status: 'POSTED' },
          data: { status: 'REVERSED', reference: 'order_cancelled' },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED, cancelReason: reason },
      });
    });
  }

  async getSellerSlaDashboard(userId: string) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile)
      throw new ForbiddenException('Seller profile not found');

    const orders = await this.prisma.order.findMany({
      where: {
        items: { some: { product: { sellerProfileId: sellerProfile.id } } },
      },
      include: { items: true },
    });

    const now = Date.now();
    const agingBuckets = { lt24h: 0, h24to72: 0, gt72h: 0 };
    let accepted = 0;
    let packed = 0;
    let shipped = 0;
    let delivered = 0;

    for (const order of orders) {
      const ageHours = (now - order.createdAt.getTime()) / 3600000;
      if (ageHours < 24) agingBuckets.lt24h += 1;
      else if (ageHours <= 72) agingBuckets.h24to72 += 1;
      else agingBuckets.gt72h += 1;

      if (order.status === OrderStatus.ACCEPTED) accepted += 1;
      if (order.status === OrderStatus.PACKED) packed += 1;
      if (order.status === OrderStatus.SHIPPED) shipped += 1;
      if (order.status === OrderStatus.DELIVERED) delivered += 1;
    }

    return {
      totalOrders: orders.length,
      pipeline: { accepted, packed, shipped, delivered },
      agingBuckets,
    };
  }

  async createRefundRequest(userId: string, orderId: string, reason: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) {
      throw new ForbiddenException(
        'You can only request refunds for your orders',
      );
    }
    return this.prisma.$transaction(async (tx) => {
      const refund = await tx.refundRequest.create({
        data: {
          orderId,
          reason,
          createdByUserId: userId,
        },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.REFUND_PENDING },
      });
      return refund;
    });
  }

  listOpenRefunds() {
    return this.prisma.refundRequest.findMany({
      where: { status: RefundStatus.OPEN },
      include: { order: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async resolveRefund(
    refundId: string,
    adminUserId: string,
    approve: boolean,
    adminNote: string,
  ) {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: { order: { include: { items: true } } },
    });
    if (!refund) throw new NotFoundException('Refund request not found');

    return this.prisma.$transaction(async (tx) => {
      const updatedRefund = await tx.refundRequest.update({
        where: { id: refundId },
        data: {
          status: approve ? RefundStatus.APPROVED : RefundStatus.REJECTED,
          adminNote,
          resolvedByUserId: adminUserId,
          resolvedAt: new Date(),
        },
      });

      if (approve) {
        for (const item of refund.order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.settlementEntry.updateMany({
          where: { orderId: refund.orderId, status: 'POSTED' },
          data: { status: 'REVERSED', reference: 'refund_approved' },
        });
      }

      await tx.order.update({
        where: { id: refund.orderId },
        data: { status: approve ? OrderStatus.REFUNDED : OrderStatus.DISPUTED },
      });

      return updatedRefund;
    });
  }

  async updateStatusByPaymentRef(paymentRef: string, paid: boolean) {
    const order = await this.prisma.order.findFirst({
      where: { paymentRef },
      include: { items: true, reservations: true },
    });
    if (!order)
      throw new NotFoundException('Order not found for payment reference');

    return this.prisma.$transaction(async (tx) => {
      if (!paid) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.inventoryReservation.updateMany({
        where: { orderId: order.id },
        data: {
          status: paid
            ? ReservationStatus.CONFIRMED
            : ReservationStatus.RELEASED,
        },
      });

      if (paid) {
        for (const item of order.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          const grossAmount = item.snapshotPrice * item.quantity;
          const commissionAmount = Math.floor(grossAmount * 0.1);
          const netAmount = grossAmount - commissionAmount;
          await tx.settlementEntry.create({
            data: {
              orderId: order.id,
              sellerProfileId: product?.sellerProfileId ?? null,
              type: 'SALE',
              grossAmount,
              commissionAmount,
              netAmount,
              currency: order.currency,
              reference: paymentRef,
            },
          });
        }
      }

      return tx.order.update({
        where: { id: order.id },
        data: { status: paid ? OrderStatus.PAID : OrderStatus.FAILED },
        include: { items: true, reservations: true },
      });
    });
  }
}
