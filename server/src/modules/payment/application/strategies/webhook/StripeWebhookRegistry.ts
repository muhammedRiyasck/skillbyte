import { IStripeEventHandler } from './IStripeEventHandler';

/** Handles stripe webhook registry functionality. */
export class StripeWebhookRegistry {
  private handlers = new Map<string, IStripeEventHandler>();

  /**
   * Register for the StripeWebhookRegistry entity.
   *
   * @param handler - The handler information.
   */
  register(handler: IStripeEventHandler): void {
    this.handlers.set(handler.eventType, handler);
  }

  /**
   * Get for the StripeWebhookRegistry entity.
   *
   * @param eventType - The event type information.
   * @returns The result of the operation.
   */
  get(eventType: string): IStripeEventHandler | undefined {
    return this.handlers.get(eventType);
  }
}
