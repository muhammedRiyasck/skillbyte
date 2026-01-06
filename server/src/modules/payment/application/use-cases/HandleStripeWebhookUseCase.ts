import Stripe from 'stripe';
import { IPaymentWriteRepository } from '../../domain/IRepositories/IPaymentWriteRepository';
import logger from '../../../../shared/utils/Logger';
import { IStripeProvider } from '../../../../shared/services/payment/interfaces/IStripeProvider';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import {
  PAYMENT_EVENTS,
  PaymentSucceededEvent,
  PaymentFailedEvent,
} from '../../../../shared/services/event-bus/PaymentEvents';
import { IHandleStripeWebhook } from '../interfaces/IHandleStripeWebhook';

export class HandleStripeWebhookUseCase implements IHandleStripeWebhook {
  constructor(
    private _paymentRepository: IPaymentWriteRepository,
    private _stripeProvider: IStripeProvider,
  ) {}

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
      throw new Error(`Webhook Error: ${message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentFailed = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(paymentFailed);
        break;
      }
      default:
      // console.log(`Unhandled event type ${event.type}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    // 1. Update Payment Status to succeeded
    const payment = await this._paymentRepository.updatePaymentStatus(
      paymentIntent.id,
      'succeeded',
    );

    if (!payment) {
      logger.error('Payment record not found for intent', paymentIntent.id);
      return;
    }

    // 2. Emit event for other modules to handle
    const paymentEvent: PaymentSucceededEvent = {
      paymentId: payment.paymentId!,
      userId: payment.userId,
      courseId: payment.courseId,
      amount: payment.amount,
      currency: payment.currency,
      metadata: payment.metadata,
    };

    logger.info(
      `Emitting payment.succeeded event for payment ${payment.paymentId}`,
    );
    eventBus.emit(PAYMENT_EVENTS.PAYMENT_SUCCEEDED, paymentEvent);
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this._paymentRepository.updatePaymentStatus(
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
