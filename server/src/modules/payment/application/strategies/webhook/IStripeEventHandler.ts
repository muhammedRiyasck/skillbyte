import Stripe from 'stripe';

export interface IStripeEventHandler {
  readonly eventType: string;
  handle(event: Stripe.Event): Promise<void>;
}
