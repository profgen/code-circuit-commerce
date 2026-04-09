import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, ReservationStatus } from '@prisma/client';
import { CartService } from '../cart/cart.service';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutInitDto, CreateCouponDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async initCheckout(userId: string, payload: CheckoutInitDto) {
    const { idempotencyKey, couponCode, useWallet } = payload;
    if (!idempotencyKey) {
      throw new BadRequestException('idempotencyKey is required');
    }
    const cart = await this.cartService.getCart(userId);
    if (!cart) throw new BadRequestException('Cart not found');
    const items = cart.items;
    if (items.length === 0) throw new BadRequestException('Cart is empty');

    const subtotalAmount = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    let discountAmount = 0;
    let storeCreditUsed = 0;
    let appliedCouponCode: string | undefined;
    const currency = items[0].product.currency;
    if (couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (!coupon || !coupon.isActive) {
        throw new BadRequestException('Invalid coupon');
      }
      const now = new Date();
      if (now < coupon.startsAt || now > coupon.endsAt) {
        throw new BadRequestException('Coupon is not active');
      }
      if (subtotalAmount < coupon.minOrderAmount) {
        throw new BadRequestException('Order does not meet coupon minimum');
      }
      const userRedemptions = await this.prisma.couponRedemption.count({
        where: { couponId: coupon.id, userId },
      });
      if (userRedemptions >= coupon.maxRedemptionsPerUser) {
        throw new BadRequestException('Coupon redemption limit reached');
      }
      discountAmount =
        coupon.discountType === 'PERCENTAGE'
          ? Math.floor((subtotalAmount * coupon.discountValue) / 100)
          : coupon.discountValue;
      discountAmount = Math.min(discountAmount, subtotalAmount);
      appliedCouponCode = coupon.code;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (useWallet && user.walletBalance > 0) {
      storeCreditUsed = Math.min(
        user.walletBalance,
        subtotalAmount - discountAmount,
      );
    }

    const finalAmount = Math.max(
      0,
      subtotalAmount - discountAmount - storeCreditUsed,
    );
    const payment =
      finalAmount > 0
        ? await this.paymentsService.createPaymentIntent(finalAmount, currency)
        : { paymentIntentId: `wallet_${Date.now()}`, clientSecret: null };

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new BadRequestException(
            `Insufficient stock for ${item.product.title}`,
          );
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING_PAYMENT,
          totalAmount: finalAmount,
          discountAmount,
          storeCreditUsed,
          couponCode: appliedCouponCode,
          currency,
          paymentRef: payment.paymentIntentId,
          idempotencyKey,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              snapshotTitle: item.product.title,
              snapshotPrice: item.product.price,
              quantity: item.quantity,
            })),
          },
          reservations: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              status: ReservationStatus.PENDING,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            })),
          },
        },
        include: { items: true, reservations: true },
      });

      if (appliedCouponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: appliedCouponCode },
        });
        if (coupon) {
          await tx.couponRedemption.create({
            data: { couponId: coupon.id, userId, orderId: createdOrder.id },
          });
        }
      }

      if (storeCreditUsed > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { decrement: storeCreditUsed } },
        });
        await tx.walletTransaction.create({
          data: {
            userId,
            orderId: createdOrder.id,
            type: 'DEBIT',
            amount: storeCreditUsed,
            description: 'Store credit used at checkout',
          },
        });
      }

      if (finalAmount === 0) {
        await tx.order.update({
          where: { id: createdOrder.id },
          data: { status: OrderStatus.PAID },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrder;
    });

    return { order, payment };
  }

  createCoupon(dto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderAmount: dto.minOrderAmount,
        maxRedemptionsPerUser: dto.maxRedemptionsPerUser,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
      },
    });
  }

  disableCoupon(code: string) {
    return this.prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: { isActive: false },
    });
  }

  listCoupons() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
