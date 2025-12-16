import Stripe from 'stripe';
import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';
import logger from '../../../../shared/utils/Logger';
import { IHandleStripeWebhook } from '../interfaces/IHandleStripeWebhook';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

export class HandleStripeWebhookUseCase implements IHandleStripeWebhook {
  constructor(private enrollmentRepository: IEnrollmentRepository) {}

  async execute(signature: string, payload: Buffer) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
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
    const payment = await this.enrollmentRepository.updatePaymentStatus(
      paymentIntent.id,
      'succeeded',
    );

    if (!payment) {
      logger.error('Payment record not found for intent', paymentIntent.id);
      return;
    }

    // 2. Create Enrollment
    // Idempotency check: Check if enrollment already exists
    const existingEnrollment = await this.enrollmentRepository.findEnrollment(
      payment.userId.toString(),
      payment.courseId.toString(),
    );
    if (existingEnrollment) {
      return;
    }

    await this.enrollmentRepository.createEnrollment({
      userId: payment.userId,
      courseId: payment.courseId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      paymentId: payment._id as any,
      status: 'completed',
      enrolledAt: new Date(),
      progress: 0,
    });
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    await this.enrollmentRepository.updatePaymentStatus(
      paymentIntent.id,
      'failed',
    );
  }
}
