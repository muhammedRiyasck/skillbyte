import Stripe from "stripe";
import { IEnrollmentRepository } from "../../domain/IEnrollmentRepository";
import { IHandleStripeWebhook } from "../interfaces/IHandleStripeWebhook";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-11-17.clover",
});

export class HandleStripeWebhookUseCase implements IHandleStripeWebhook {

  constructor(private enrollmentRepository: IEnrollmentRepository) {}

  async execute(signature: string, payload: Buffer) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(paymentIntent);
        break;
      case "payment_intent.payment_failed":
        const paymentFailed = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(paymentFailed);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    console.log(`Payment succeeded for intent: ${paymentIntent.id}`);
    
    // 1. Update Payment Status to succeeded
    const payment = await this.enrollmentRepository.updatePaymentStatus(paymentIntent.id, "succeeded");
    
    if (!payment) {
        console.error("Payment record not found for intent", paymentIntent.id);
        return;
    }

    // 2. Create Enrollment
    // Idempotency check: Check if enrollment already exists
    const existingEnrollment = await this.enrollmentRepository.findEnrollment(payment.userId.toString(), payment.courseId.toString());
    if (existingEnrollment) {
        console.log("Enrollment already exists, skipping creation.");
        return;
    }

    await this.enrollmentRepository.createEnrollment({
        userId: payment.userId,
        courseId: payment.courseId,
        paymentId: payment._id as any,
        status: "completed",
        enrolledAt: new Date(),
        progress: 0
    });
    
    console.log("Enrollment created successfully.");
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
      console.log(`Payment failed for intent: ${paymentIntent.id}`);
      await this.enrollmentRepository.updatePaymentStatus(paymentIntent.id, "failed");
  }
}
