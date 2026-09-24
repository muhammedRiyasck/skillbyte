import Stripe from 'stripe';
import logger from '../../../../shared/utils/Logger';
import { IStripeProvider } from '../../../../shared/services/payment/interfaces/IStripeProvider';
import { IHandleStripeWebhook } from '../interfaces/IHandleStripeWebhook';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { StripeWebhookRegistry } from '../strategies/webhook/StripeWebhookRegistry';

/** Executes the business logic for handle stripe webhook. */
export class HandleStripeWebhookUseCase implements IHandleStripeWebhook {
  constructor(
    private _stripeProvider: IStripeProvider,
    private _webhookRegistry: StripeWebhookRegistry,
  ) {}

  /**
   * Execute for the HandleStripeWebhook entity.
   *
   * @param signature - The signature information.
   * @param payload - The payload information.
   */
  async execute(signature: string, payload: Buffer): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this._stripeProvider.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Webhook signature verification failed: ${message}`);
      throw new HttpError(
        `Webhook Error: ${message}`,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    logger.info(`STRIPE EVENT RECEIVED: ${event.type}`);

    const handler = this._webhookRegistry.get(event.type);
    if (handler) {
      await handler.handle(event);
    } else {
      logger.info(`Unhandled event type ${event.type}`);
    }
  }
}
