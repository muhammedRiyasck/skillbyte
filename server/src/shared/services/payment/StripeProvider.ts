import Stripe from 'stripe';
import { IStripeProvider } from './interfaces/IStripeProvider';
import {
  IPaymentProvider,
  PaymentInitiationResponse,
} from './interfaces/IPaymentProvider';

/** Handles stripe provider functionality. */
export class StripeProvider implements IStripeProvider, IPaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-11-17.clover',
    });
  }

  /**
   * Initiate for the StripeProvider entity.
   *
   * @param amount - The amount information.
   * @param currency - The currency information.
   * @param metadata - The metadata information.
   * @returns The standardized HTTP response.
   */
  async initiate(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<PaymentInitiationResponse> {
    const amountInCents = Math.round(amount * 100);
    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    };

    const paymentIntent =
      await this.stripe.paymentIntents.create(paymentIntentData);

    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret || undefined,
    };
  }

  /**
   * Normalize amount for the StripeProvider entity.
   *
   * @param amount - The amount information.
   * @param currency - The currency information.
   */
  normalizeAmount(amount: number, currency: string) {
    return {
      chargeAmount: amount,
      chargeCurrency: currency,
    };
  }

  /**
   * Map provider transaction id for the StripeProvider entity.
   *
   * @param responseId - The unique identifier for the response.
   * @returns The result of the operation.
   */
  mapProviderTransactionId(responseId: string): Record<string, string> {
    return { stripePaymentIntentId: responseId };
  }

  /**
   * Construct event for the StripeProvider entity.
   *
   * @param payload - The payload information.
   * @param header - The header information.
   * @param secret - The secret information.
   * @returns The result of the operation.
   */
  constructEvent(
    payload: string | Buffer,
    header: string,
    secret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, header, secret);
  }

  /**
   * Refund for the StripeProvider entity.
   *
   * @param paymentIntentId - The unique identifier for the paymentIntent.
   * @returns The result of the operation.
   */
  async refund(paymentIntentId: string): Promise<boolean> {
    try {
      await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
      return true;
    } catch (error) {
      console.error('Stripe Refund Error:', error);
      return false;
    }
  }

  /**
   * Create account for the StripeProvider entity.
   *
   * @param email - The email information.
   * @returns The result of the operation.
   */
  async createAccount(email: string): Promise<Stripe.Account> {
    return this.stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
  }

  /**
   * Create account link for the StripeProvider entity.
   *
   * @param stripeAccountId - The unique identifier for the stripeAccount.
   * @param returnUrl - The return url information.
   * @param refreshUrl - The refresh url information.
   * @returns The result of the operation.
   */
  async createAccountLink(
    stripeAccountId: string,
    returnUrl: string,
    refreshUrl: string,
  ): Promise<Stripe.AccountLink> {
    return this.stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
  }

  /**
   * Payout for the StripeProvider entity.
   *
   * @param amount - The amount information.
   * @param currency - The currency information.
   * @param destination - The destination information.
   * @returns The result of the operation.
   */
  async payout(
    amount: number,
    currency: string,
    destination: string,
  ): Promise<string> {
    const amountInCents = Math.round(amount * 100);
    const transfer = await this.stripe.transfers.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      destination: destination,
    });
    return transfer.id;
  }

  /**
   * Validate destination for the StripeProvider entity.
   *
   * @param destination - The destination information.
   * @returns The result of the operation.
   */
  async validateDestination(
    destination: string,
  ): Promise<{ isValid: boolean; reason?: string }> {
    try {
      const account = await this.stripe.accounts.retrieve(destination);

      if (!account.payouts_enabled) {
        return {
          isValid: false,
          reason:
            'Your Stripe account is not yet verified or payouts are disabled. Please complete your identity verification in the Stripe dashboard.',
        };
      }

      return { isValid: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        isValid: false,
        reason: `Could not verify Stripe account: ${message}`,
      };
    }
  }

  /**
   * Retrieve account for the StripeProvider entity.
   *
   * @param accountId - The unique identifier for the account.
   * @returns The result of the operation.
   */
  async retrieveAccount(accountId: string): Promise<Stripe.Account> {
    return this.stripe.accounts.retrieve(accountId);
  }

  /**
   * Create login link for the StripeProvider entity.
   *
   * @param accountId - The unique identifier for the account.
   * @returns The result of the operation.
   */
  createLoginLink(accountId: string): Promise<Stripe.LoginLink> {
    return this.stripe.accounts.createLoginLink(accountId);
  }

  /**
   * Get platform balance for the StripeProvider entity.
   *
   * @returns The result of the operation.
   */
  async getPlatformBalance(): Promise<Stripe.Balance> {
    return this.stripe.balance.retrieve();
  }

  /**
   * Cancel payment intent for the StripeProvider entity.
   *
   * @param paymentIntentId - The unique identifier for the paymentIntent.
   * @returns The result of the operation.
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);
      return true;
    } catch (error) {
      // Stripe returns an error if the intent is already cancelled or succeeded.
      // We log the warning but don't throw – the booking cancellation should still proceed.
      console.warn(`Could not cancel PaymentIntent ${paymentIntentId}:`, error);
      return false;
    }
  }

  /**
   * Retrieve payment intent client secret for the StripeProvider entity.
   *
   * @param paymentIntentId - The unique identifier for the paymentIntent.
   * @returns The result of the operation.
   */
  async retrievePaymentIntentClientSecret(
    paymentIntentId: string,
  ): Promise<string | null> {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return intent.client_secret ?? null;
    } catch (error) {
      console.warn(
        `Could not retrieve PaymentIntent ${paymentIntentId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Validate balance for the StripeProvider entity.
   *
   * @param amount - The amount information.
   * @param currency - The currency information.
   * @returns The result of the operation.
   */
  async validateBalance(
    amount: number,
    currency: string,
  ): Promise<{
    isAvailable: boolean;
    reason?: string;
    availableAmount?: number;
  }> {
    try {
      const balance = await this.stripe.balance.retrieve();
      const currencyLower = currency.toLowerCase();

      // Find the available balance for the requested currency
      const available = balance.available.find(
        (b) => b.currency === currencyLower,
      );

      const availableAmount = available ? available.amount / 100 : 0; // Convert cents to whole

      if (availableAmount < amount) {
        // Detailed error message to help the admin understand the currency mismatch
        let reason = `Insufficient funds in ${currency.toUpperCase()}. Platform has ${availableAmount} ${currency.toUpperCase()} available.`;

        // If platform has a different currency available (like USD), mention it to help the developer
        const otherBalances = balance.available
          .filter((b) => b.currency !== currencyLower && b.amount > 0)
          .map((b) => `${b.amount / 100} ${b.currency.toUpperCase()}`)
          .join(', ');

        if (otherBalances) {
          reason += ` (Platform currently has: ${otherBalances})`;
        }

        reason += `. Please top up your ${currency.toUpperCase()} balance in the Stripe Dashboard to approve this withdrawal.`;

        return {
          isAvailable: false,
          reason,
          availableAmount,
        };
      }

      return { isAvailable: true, availableAmount };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        isAvailable: false,
        reason: `Failed to verify platform balance: ${message}`,
      };
    }
  }
}
