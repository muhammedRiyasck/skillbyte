import Stripe from 'stripe';

export interface IStripeProvider {
  constructEvent(
    payload: string | Buffer,
    header: string,
    secret: string,
  ): Stripe.Event;

  createAccount(email: string): Promise<Stripe.Account>;

  createAccountLink(
    stripeAccountId: string,
    returnUrl: string,
    refreshUrl: string,
  ): Promise<Stripe.AccountLink>;

  retrieveAccount(accountId: string): Promise<Stripe.Account>;

  createLoginLink(accountId: string): Promise<Stripe.LoginLink>;
  getPlatformBalance(): Promise<Stripe.Balance>;

  /**
   * Cancels an open PaymentIntent in Stripe so the user can no longer
   * complete the payment after their booking has been expired by the system.
   */
  cancelPaymentIntent(paymentIntentId: string): Promise<boolean>;
}
