import Stripe from 'stripe';
import mongoose from 'mongoose';
import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';
import { CourseModel } from '../../../course/infrastructure/models/CourseModel';
import { IPayment } from '../../infrastructure/models/PaymentModel';
import { ICreatePaymentIntent } from '../interfaces/ICreatePaymentIntent';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover', // Use latest or configured API version
});

export class CreatePaymentIntentUseCase implements ICreatePaymentIntent {
  private enrollmentRepository: IEnrollmentRepository;

  constructor(enrollmentRepository: IEnrollmentRepository) {
    this.enrollmentRepository = enrollmentRepository;
  }

  async execute(
    userId: string,
    courseId: string,
  ): Promise<{ clientSecret: string | null; paymentId: string }> {
    // 1. Fetch Course details to get Price
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    if (!course.price || course.price <= 0) {
      throw new Error('Course is free or invalid price');
      // Handle free courses separately if needed (direct enrollment)
    }

    // 2. Check if already enrolled
    const existingEnrollment = await this.enrollmentRepository.findEnrollment(
      userId,
      courseId,
    );
    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    // 3. Create Stripe PaymentIntent
    const amountInCents = Math.round(course.price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'inr',
      metadata: {
        userId,
        courseId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 4. Save Payment Record (Pending)
    const adminFee = course.price * 0.2; // 20% platform fee
    const instructorAmount = course.price - adminFee;

    const paymentData: Partial<IPayment> = {
      userId: new mongoose.Types.ObjectId(userId),
      courseId: new mongoose.Types.ObjectId(courseId),
      instructorId: course.instructorId,
      amount: course.price,
      currency: 'inr',
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      adminFee,
      instructorAmount,
      metadata: {
        clientSecret: paymentIntent.client_secret,
      },
    };

    const payment = await this.enrollmentRepository.createPayment(paymentData);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: (payment._id as mongoose.Types.ObjectId).toString(),
    };
  }
}
