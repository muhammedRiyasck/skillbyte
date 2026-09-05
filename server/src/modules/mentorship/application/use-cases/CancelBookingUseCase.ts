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
import { IRefundPaymentUseCase } from '../../../payment/application/interfaces/IRefundPaymentUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import logger from '../../../../shared/utils/Logger';

export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    private bookingRepo: IMentorshipBookingRepository,
    private slotRepo: IMentorshipSlotRepository,
    private paymentReadRepo: IPaymentReadRepository,
    private refundPaymentUc: IRefundPaymentUseCase,
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
            await this.refundPaymentUc.execute(
              payment.paymentId!,
              `Mentorship booking ${bookingId} cancelled by ${cancelledBy}`,
            );
          }
        }
      } else if (payment && payment.status === PaymentStatus.PENDING) {
        logger.info(
          `CancelBooking: Payment ${payment.paymentId} is still pending (uncaptured). No refund needed.`,
        );
      }
    }

    // 4. Mark Booking as Cancelled
    await this.bookingRepo.markAsCancelled(bookingId, cancelledBy);

    // 5. Free up seat on slot
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
