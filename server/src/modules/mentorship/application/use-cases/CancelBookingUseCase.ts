import { UserRole } from '../../../../shared/enums/UserRole';
import { PaymentStatus } from '../../../../shared/enums/PaymentStatus';
import {
  BookingStatus,
  CancelledBy,
} from '../../domain/entities/MentorshipBooking';

import { ICancelBookingUseCase } from '../interfaces/IBookingUseCases';
import { CancelBookingDto } from '../dtos/BookingDto';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import { MENTORSHIP_EVENTS } from '../../../../shared/services/event-bus/MentorshipEvents';
import { IPaymentReadRepository } from '../../../payment/domain/IRepositories/IPaymentReadRepository';
import { IPaymentWriteRepository } from '../../../payment/domain/IRepositories/IPaymentWriteRepository';
import { IPaymentProvider } from '../../../../shared/services/payment/interfaces/IPaymentProvider';
import { IPayPalProvider } from '../../../../shared/services/payment/interfaces/IPayPalProvider';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import logger from '../../../../shared/utils/Logger';

export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    private bookingRepo: IMentorshipBookingRepository,
    private slotRepo: IMentorshipSlotRepository,
    private paymentReadRepo: IPaymentReadRepository,
    private paymentWriteRepo: IPaymentWriteRepository,
    private stripeProvider: IPaymentProvider,
    private paypalProvider: IPayPalProvider & IPaymentProvider,
  ) {}

  async execute(dto: CancelBookingDto): Promise<void> {
    const { bookingId, cancelledBy } = dto;

    // 1. Find Booking
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new HttpError('Booking not found', HttpStatusCode.NOT_FOUND);
    }

    // 2. Check status
    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new HttpError(
        'Booking cannot be cancelled',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // 3. Refund Logic
    if (booking.paymentId) {
      const payment = await this.paymentReadRepo.findById(booking.paymentId);
      if (payment && payment.status === PaymentStatus.SUCCEEDED) {
        // Policy Check
        let shouldRefund = false;
        const now = new Date();
        const scheduledAt = new Date(booking.scheduledAt);
        const hoursDifference =
          (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (
          cancelledBy === UserRole.INSTRUCTOR ||
          cancelledBy === CancelledBy.SYSTEM
        ) {
          // Instructor-initiated or system-initiated (cleanup job) cancellations always refund.
          // System cleanup only runs when a booking is still PENDING (payment not yet captured),
          // so a real refund won't be triggered in practice – but we allow it as a safety net.
          shouldRefund = true;
        } else if (hoursDifference > 24) {
          shouldRefund = true;
        } else {
          throw new HttpError('Refund not allowed', HttpStatusCode.BAD_REQUEST);
        }

        if (shouldRefund) {
          let refundSuccess = false;

          if (payment.stripePaymentIntentId) {
            logger.info(
              `Initiating Stripe refund for payment ${payment.paymentId}`,
            );
            refundSuccess = await this.stripeProvider.refund(
              payment.stripePaymentIntentId,
            );
          } else if (payment.paypalCaptureId) {
            logger.info(
              `Initiating PayPal refund for payment ${payment.paymentId}`,
            );
            refundSuccess = await this.paypalProvider.refund(
              payment.paypalCaptureId,
            );
          } else {
            logger.warn(
              `No provider transaction ID found for refund on payment ${payment.paymentId}`,
            );
          }

          if (refundSuccess) {
            await this.paymentWriteRepo.updateStatus(
              payment.paymentId!,
              PaymentStatus.REFUNDED,
            );
            logger.info(`Refund successful for payment ${payment.paymentId}`);
          } else {
            throw new HttpError('Refund failed', HttpStatusCode.BAD_REQUEST);
          }
        }
      }
    }
    // 4. Mark Booking as Cancelled
    await this.bookingRepo.markAsCancelled(bookingId, cancelledBy);

    // 5. Free up seat on slot.
    // decrementBookings() atomically decrements currentBookings and restores status
    // to AVAILABLE when currentBookings drops below maxBookings – no need to call
    // updateStatus() manually here (doing so would race against concurrent bookings).
    if (booking.slotId) {
      const slot = await this.slotRepo.findById(booking.slotId);
      if (slot && slot.slotId) {
        await this.slotRepo.decrementBookings(slot.slotId);
      }
    }

    // 6. Emit Cancellation Event
    eventBus.emit(MENTORSHIP_EVENTS.BOOKING_CANCELLED, {
      bookingId: booking.bookingId!,
      cancelledBy,
      studentId: booking.studentId,
      instructorId: booking.instructorId,
    });
  }
}
