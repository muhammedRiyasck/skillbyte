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

    // 3. Refund Logic – only attempt a refund when money was actually captured.
    if (booking.paymentId) {
      const payment = await this.paymentReadRepo.findById(booking.paymentId);

      if (payment && payment.status === PaymentStatus.SUCCEEDED) {
        // SYSTEM cleanup only cancels PENDING bookings (no payment captured yet),
        // so this branch should never trigger for system cancels in practice.
        // Guard it explicitly to be 100% safe.
        if (cancelledBy === CancelledBy.SYSTEM) {
          logger.warn(
            `CancelBooking: SYSTEM cancel on a SUCCEEDED payment for booking ${bookingId}. ` +
              `Skipping refund – manual review required.`,
          );
          // Do NOT refund. Fall through to mark the booking cancelled.
        } else {
          // Policy Check: only students/instructors trigger the refund path.
          let shouldRefund = false;
          const now = new Date();
          const scheduledAt = new Date(booking.scheduledAt);
          const hoursDifference =
            (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

          if (cancelledBy === UserRole.INSTRUCTOR) {
            // Instructor-initiated cancellations always refund.
            shouldRefund = true;
          } else if (hoursDifference > 24) {
            // Student-initiated: refund allowed if >24 h before session.
            shouldRefund = true;
          } else {
            // Student-initiated within 24 h: no refund.
            throw new HttpError(
              'Refund not allowed',
              HttpStatusCode.BAD_REQUEST,
            );
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
              // Payment was recorded as SUCCEEDED but has no provider ID – edge case.
              // Log and proceed with cancellation; no money was actually taken via a known provider.
              logger.warn(
                `CancelBooking: No provider transaction ID on payment ${payment.paymentId}. ` +
                  `Proceeding with cancellation without a refund.`,
              );
              refundSuccess = true; // treat as no-op refund; no real charge to reverse
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
      } else if (payment && payment.status === PaymentStatus.PENDING) {
        // Payment intent exists but has NOT been captured. Nothing to refund.
        // The MentorshipCleanupProcessor already voids the Stripe PaymentIntent
        // before calling this use-case, so we just proceed with cancellation.
        logger.info(
          `CancelBooking: Payment ${payment.paymentId} is still pending (uncaptured). No refund needed.`,
        );
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
      previousStatus: booking.status,
    });
  }
}
