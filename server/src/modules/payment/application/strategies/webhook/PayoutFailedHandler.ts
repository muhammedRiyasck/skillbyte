import Stripe from 'stripe';
import { IStripeEventHandler } from './IStripeEventHandler';
import logger from '../../../../../shared/utils/Logger';

export class PayoutFailedHandler implements IStripeEventHandler {
  readonly eventType = 'payout.failed';

  async handle(event: Stripe.Event): Promise<void> {
    const payout = event.data.object as Stripe.Payout;
    logger.error(
      `Stripe payout failed: ${payout.id} for account ${payout.destination}`,
    );
  }
}
