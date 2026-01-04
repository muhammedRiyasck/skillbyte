import mongoose from 'mongoose';
import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';
import { CourseModel } from '../../../course/infrastructure/models/CourseModel';
import { IPaymentRepository } from '../../domain/IPaymentRepository';
import { IPayment } from '../../infrastructure/models/PaymentModel';
import { PaymentProviderFactory } from '../../../../shared/services/payment/PaymentProviderFactory';
import { IInitiateEnrollmentPayment } from '../interfaces/IInitiateEnrollmentPayment';
import { PaymentInitiationResponse } from '../../../../shared/services/payment/interfaces/IPaymentProvider';

export class InitiateEnrollmentPaymentUseCase
  implements IInitiateEnrollmentPayment
{
  constructor(
    private _enrollmentRepository: IEnrollmentRepository,
    private _paymentRepository: IPaymentRepository,
    private _paymentProviderFactory: PaymentProviderFactory,
  ) {}

  async execute(
    userId: string,
    courseId: string,
    providerName: string,
  ): Promise<{
    providerResponse: PaymentInitiationResponse;
    paymentId: string;
  }> {
    // 1. Fetch course details
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // 2. Check if already enrolled
    const enrollment = await this._enrollmentRepository.findEnrollment(
      userId,
      courseId,
    );
    if (enrollment) {
      throw new Error('Already enrolled in this course');
    }

    // 3. Get provider from factory
    const provider = this._paymentProviderFactory.getProvider(providerName);

    // 4. Initiate payment with provider
    const isPayPal = providerName.toLowerCase() === 'paypal';
    const currency = isPayPal ? 'USD' : 'inr';

    let amountToCharge = course.price;
    let convertedAmount: number | undefined;

    if (isPayPal) {
      const exchangeRate = 83; // 1 USD = 83 INR
      convertedAmount = Math.round((course.price / exchangeRate) * 100) / 100;
      amountToCharge = convertedAmount;
    }

    const providerResponse = await provider.initiate(amountToCharge, currency, {
      userId,
      courseId,
    });
    // 5. Create local payment record (Pending)
    const adminFee = course.price * 0.2; // 20% platform fee
    const instructorAmount = course.price - adminFee;
    const paymentData: Partial<IPayment> = {
      userId: new mongoose.Types.ObjectId(userId),
      courseId: new mongoose.Types.ObjectId(courseId),
      instructorId: course.instructorId,
      amount: course.price,
      currency: 'INR',
      status: 'pending',
      adminFee,
      instructorAmount,
      convertedAmount,
      convertedCurrency: isPayPal ? 'USD' : undefined,
    };

    // Handle provider-specific IDs for the record
    if (providerName.toLowerCase() === 'stripe') {
      paymentData.stripePaymentIntentId = providerResponse.id;
    } else if (providerName.toLowerCase() === 'paypal') {
      paymentData.paypalOrderId = providerResponse.id;
    }

    const payment = await this._paymentRepository.createPayment(paymentData);

    return {
      providerResponse,
      paymentId: (payment._id as mongoose.Types.ObjectId).toString(),
    };
  }
}
