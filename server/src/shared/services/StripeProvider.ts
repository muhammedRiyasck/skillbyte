import Stripe from 'stripe';
import { IStripeProvider } from '../../modules/enrollment/application/interfaces/IStripeProvider';
import {
  IPaymentProvider,
  PaymentInitiationResponse,
} from '../../modules/enrollment/application/interfaces/IPaymentProvider';

export class StripeProvider implements IStripeProvider, IPaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-11-17.clover',
    });
  }

  async initiate(
    amount: number,
    currency: string,
    metadata: { userId: string; courseId: string },
  ): Promise<PaymentInitiationResponse> {
    const amountInCents = Math.round(amount * 100);
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret || undefined,
    };
  }


  constructEvent(
    payload: string | Buffer,
    header: string,
    secret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, header, secret);
  }
}
