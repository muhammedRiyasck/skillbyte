import Stripe from 'stripe';
import { IStripeProvider } from './interfaces/IStripeProvider';
import {
  IPaymentProvider,
  PaymentInitiationResponse,
} from './interfaces/IPaymentProvider';

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

  constructEvent(
    payload: string | Buffer,
    header: string,
    secret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, header, secret);
  }

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

  async retrieveAccount(accountId: string): Promise<Stripe.Account> {
    return this.stripe.accounts.retrieve(accountId);
  }

  createLoginLink(accountId: string): Promise<Stripe.LoginLink> {
    return this.stripe.accounts.createLoginLink(accountId);
  }

  async getPlatformBalance(): Promise<Stripe.Balance> {
    return this.stripe.balance.retrieve();
  }

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
