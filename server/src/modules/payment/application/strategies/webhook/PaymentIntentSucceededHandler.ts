import Stripe from 'stripe';
import { IStripeEventHandler } from './IStripeEventHandler';
import { IPaymentWriteRepository } from '../../../domain/IRepositories/IPaymentWriteRepository';
import { eventBus } from '../../../../../shared/services/event-bus/EventBus';
import {
  PAYMENT_EVENTS,
  PaymentSucceededEvent,
} from '../../../../../shared/services/event-bus/PaymentEvents';
import logger from '../../../../../shared/utils/Logger';

/** Handles payment intent succeeded handler functionality. */
export class PaymentIntentSucceededHandler implements IStripeEventHandler {
  readonly eventType = 'payment_intent.succeeded';

  constructor(private paymentRepository: IPaymentWriteRepository) {}

  /**
   * Handle for the PaymentIntentSucceededHandler entity.
   *
   * @param event - The event information.
   */
  async handle(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const payment = await this.paymentRepository.updatePaymentStatus(
      paymentIntent.id,
      'succeeded',
    );

    if (!payment) {
      logger.error('Payment record not found for intent', paymentIntent.id);
      return;
    }

    const paymentEvent: PaymentSucceededEvent = {
      paymentId: payment.paymentId!,
      userId: payment.userId,
      courseId: payment.courseId,
      mentorshipBookingId: payment.mentorshipBookingId,
      amount: payment.amount,
      currency: payment.currency,
      instructorId: payment.instructorId,
      instructorAmount: payment.instructorAmount,
      metadata: payment.metadata,
    };

    logger.info(
      `Emitting payment.succeeded event for payment ${payment.paymentId}`,
    );
    eventBus.emit(PAYMENT_EVENTS.PAYMENT_SUCCEEDED, paymentEvent);
  }
}
