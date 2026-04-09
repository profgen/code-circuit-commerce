import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY ?? 'sk_test_replace',
  );

  async createPaymentIntent(amount: number, currency: string) {
    const intent = await this.stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
    });
    return { paymentIntentId: intent.id, clientSecret: intent.client_secret };
  }
}
