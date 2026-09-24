import Stripe from 'stripe';
import { IStripeEventHandler } from './IStripeEventHandler';
import { IPaymentWriteRepository } from '../../../domain/IRepositories/IPaymentWriteRepository';
import { eventBus } from '../../../../../shared/services/event-bus/EventBus';
import {
  PAYMENT_EVENTS,
  PaymentFailedEvent,
} from '../../../../../shared/services/event-bus/PaymentEvents';

/** Handles payment intent failed handler functionality. */
export class PaymentIntentFailedHandler implements IStripeEventHandler {
  readonly eventType = 'payment_intent.payment_failed';

  constructor(private paymentRepository: IPaymentWriteRepository) {}

  /**
   * Handle for the PaymentIntentFailedHandler entity.
   *
   * @param event - The event information.
   */
  async handle(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const payment = await this.paymentRepository.updatePaymentStatus(
      paymentIntent.id,
      'failed',
    );

    if (payment) {
      const failedEvent: PaymentFailedEvent = {
        paymentId: payment.paymentId!,
        userId: payment.userId,
        reason: 'Payment failed',
      };

      eventBus.emit(PAYMENT_EVENTS.PAYMENT_FAILED, failedEvent);
    }
  }
}
