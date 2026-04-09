import { Body, Controller, Headers, Post } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('intent')
  createIntent(@Body() body: { amount: number; currency: string }) {
    return this.paymentsService.createPaymentIntent(body.amount, body.currency);
  }

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') _signature: string,
    @Body() body: { type?: string; data?: { object?: { id?: string } } },
  ) {
    const eventType = body.type ?? '';
    const paymentRef = body.data?.object?.id;
    if (paymentRef && eventType === 'payment_intent.succeeded') {
      await this.ordersService.updateStatusByPaymentRef(paymentRef, true);
    }
    if (paymentRef && eventType === 'payment_intent.payment_failed') {
      await this.ordersService.updateStatusByPaymentRef(paymentRef, false);
    }
    return { received: true };
  }
}
