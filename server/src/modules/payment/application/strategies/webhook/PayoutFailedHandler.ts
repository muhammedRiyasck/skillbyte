import Stripe from 'stripe';
import { IStripeEventHandler } from './IStripeEventHandler';
import logger from '../../../../../shared/utils/Logger';

/** Handles payout failed handler functionality. */
export class PayoutFailedHandler implements IStripeEventHandler {
  readonly eventType = 'payout.failed';

  /**
   * Handle for the PayoutFailedHandler entity.
   *
   * @param event - The event information.
   */
  async handle(event: Stripe.Event): Promise<void> {
    const payout = event.data.object as Stripe.Payout;
    logger.error(
      `Stripe payout failed: ${payout.id} for account ${payout.destination}`,
    );
  }
}
