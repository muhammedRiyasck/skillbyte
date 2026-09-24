import { IPaymentWriteRepository } from '../../domain/IRepositories/IPaymentWriteRepository';
import { PaymentProviderFactory } from '../../../../shared/services/payment/PaymentProviderFactory';
import { IPayment } from '../../domain/entities/Payment';
import { PaymentStatus } from '../../../../shared/enums/PaymentStatus';
import { PaymentInitiationResponse } from '../../../../shared/services/payment/interfaces/IPaymentProvider';
import { InitiatePaymentDto } from '../dtos/InitiatePaymentDto';
import { IInitiatePayment } from '../interfaces/IInitiatePayment';
import { IPaymentReadRepository } from '../../domain/IRepositories/IPaymentReadRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Executes the business logic for initiate payment. */
export class InitiatePaymentUseCase implements IInitiatePayment {
  constructor(
    private paymentRepo: IPaymentWriteRepository,
    private paymentReadRepo: IPaymentReadRepository,
    private paymentProviderFactory: PaymentProviderFactory,
  ) {}

  /**
   * Execute for the InitiatePayment entity.
   *
   * @param request - The request information.
   * @returns The standardized HTTP response.
   */
  async execute(request: InitiatePaymentDto): Promise<{
    providerResponse: PaymentInitiationResponse;
    paymentId: string;
  }> {
    const {
      userId,
      courseId,
      mentorshipBookingId,
      instructorId,
      amount,
      currency,
      providerName,
      productName,
      productImage,
      studentName,
      studentEmail,
    } = request;

    // 0. Minimum amount validation for INR (Stripe/PayPal requirement)
    if (currency === 'INR' && amount > 0 && amount < 99) {
      throw new HttpError(
        'Transaction amount must be at least ₹99.00 or free',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // 0.5 Check for existing purchases
    const completedPayment =
      await this.paymentReadRepo.findPaymentByUserAndProduct(
        userId,
        courseId,
        mentorshipBookingId,
        PaymentStatus.SUCCEEDED,
      );

    if (completedPayment) {
      throw new HttpError(
        'You have already purchased this item.',
        HttpStatusCode.CONFLICT,
      );
    }

    const pendingPayment =
      await this.paymentReadRepo.findPaymentByUserAndProduct(
        userId,
        courseId,
        mentorshipBookingId,
        PaymentStatus.PENDING,
      );

    // 1. Get provider from factory
    const provider = this.paymentProviderFactory.getProvider(providerName);

    // 2. Normalize amount and currency via provider strategy
    const { chargeAmount, chargeCurrency, convertedAmount, convertedCurrency } =
      provider.normalizeAmount(amount, currency);

    // 3. Initiate payment with provider
    const metadata: Record<string, string> = { userId };
    if (courseId) {
      metadata.courseId = courseId;
      metadata.returnUrl = `${process.env.FRONTEND_URL}/course/purchase-success`;
      metadata.cancelUrl = `${process.env.FRONTEND_URL}/course-details/${courseId}`;
    }
    if (mentorshipBookingId) {
      metadata.mentorshipBookingId = mentorshipBookingId;
      metadata.returnUrl = `${process.env.FRONTEND_URL}/mentorship/bookings`;
      metadata.cancelUrl = `${process.env.FRONTEND_URL}/mentorship/bookings`;
    }

    // We are now using a manual payout system via the Withdrawal module.
    // The platform collects 100% of the funds upfront during checkout.
    const adminFee =
      currency === 'INR' ? Math.round(amount * 0.2) : amount * 0.2; // Round for INR to prevent fractional drift

    const providerResponse = await provider.initiate(
      chargeAmount,
      chargeCurrency,
      metadata,
    );

    // 4. Calculate fees (already calculated adminFee)
    const instructorAmount = amount - adminFee;

    // 5. Create or Update local payment record
    const paymentData: Partial<IPayment> = {
      userId,
      courseId,
      mentorshipBookingId,
      instructorId,
      amount,
      currency,
      status: PaymentStatus.PENDING,
      adminFee,
      instructorAmount,
      productName,
      productImage,
      studentName,
      studentEmail,
      convertedAmount,
      convertedCurrency,
      ...provider.mapProviderTransactionId(providerResponse.id),
    };

    let payment;
    if (pendingPayment && pendingPayment.paymentId) {
      payment = await this.paymentRepo.updatePaymentDetails(
        pendingPayment.paymentId,
        paymentData,
      );
    } else {
      payment = await this.paymentRepo.createPayment(paymentData);
    }

    return {
      providerResponse,
      paymentId: payment!.paymentId!,
    };
  }
}
