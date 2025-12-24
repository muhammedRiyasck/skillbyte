import Stripe from 'stripe';

export interface IStripeProvider {
  constructEvent(
    payload: string | Buffer,
    header: string,
    secret: string,
  ): Stripe.Event;
}
