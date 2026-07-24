import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { IPaymentReadRepository } from '../../../../modules/payment/domain/IRepositories/IPaymentReadRepository';
import { IStripeProvider } from '../../../../shared/services/payment/interfaces/IStripeProvider';
import { IGetResumePaymentUseCase } from '../interfaces/IBookingUseCases';
import { BookingStatus } from '../../domain/entities/MentorshipBooking';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import logger from '../../../../shared/utils/Logger';

/**
 * Returns the Stripe client_secret for an existing PENDING paid booking so
 * the student can resume their interrupted Stripe checkout without cancelling
 * and rebooking.
 */
export class GetResumePaymentUseCase implements IGetResumePaymentUseCase {
  constructor(
    private readonly bookingRepo: IMentorshipBookingRepository,
    private readonly paymentReadRepo: IPaymentReadRepository,
    private readonly stripeProvider: IStripeProvider,
  ) {}

  async execute(
    bookingId: string,
    studentId: string,
  ): Promise<{ clientSecret: string }> {
    // 1. Find booking and verify ownership
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new HttpError('Booking not found', HttpStatusCode.NOT_FOUND);
    }

    if (booking.studentId !== studentId) {
      throw new HttpError(
        'You are not authorized to access this booking',
        HttpStatusCode.FORBIDDEN,
      );
    }

    // 2. Only PENDING bookings with an unpaid intent can be resumed
    if (booking.status !== BookingStatus.PENDING) {
      throw new HttpError(
        `This booking is already ${booking.status} and cannot be resumed`,
        HttpStatusCode.CONFLICT,
      );
    }

    if (new Date() > new Date(booking.scheduledAt)) {
      throw new HttpError(
        'Cannot resume payment for an expired session slot',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (!booking.paymentId) {
      throw new HttpError(
        'This booking has no associated payment — it may be a free session',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // 3. Get the Stripe PaymentIntent id from the Payment record
    const payment = await this.paymentReadRepo.findById(booking.paymentId);
    if (!payment?.stripePaymentIntentId) {
      throw new HttpError(
        'Payment details not found for this booking',
        HttpStatusCode.NOT_FOUND,
      );
    }

    // 4. Retrieve the client_secret from Stripe
    const clientSecret =
      await this.stripeProvider.retrievePaymentIntentClientSecret(
        payment.stripePaymentIntentId,
      );

    if (!clientSecret) {
      logger.warn(
        `Resume payment: Could not retrieve client_secret for intent ${payment.stripePaymentIntentId} (booking ${bookingId})`,
      );
      throw new HttpError(
        'Payment session has expired. Please cancel this booking and try again.',
        HttpStatusCode.CONFLICT,
      );
    }

    return { clientSecret };
  }
}
