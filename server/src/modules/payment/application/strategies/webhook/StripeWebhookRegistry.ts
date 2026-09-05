import { IStripeEventHandler } from './IStripeEventHandler';

export class StripeWebhookRegistry {
  private handlers = new Map<string, IStripeEventHandler>();

  register(handler: IStripeEventHandler): void {
    this.handlers.set(handler.eventType, handler);
  }

  get(eventType: string): IStripeEventHandler | undefined {
    return this.handlers.get(eventType);
  }
}
