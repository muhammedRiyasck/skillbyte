import { UserRole } from '../../../../shared/enums/UserRole';
import { PaymentStatus } from '../../../../shared/enums/PaymentStatus';
import { BookingStatus } from '../../domain/entities/MentorshipBooking';
import { SlotStatus } from '../../domain/entities/MentorshipSlot';
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

        if (cancelledBy === UserRole.INSTRUCTOR) {
          shouldRefund = true;
        } else if (hoursDifference > 24) {
          shouldRefund = true;
        } else {
          throw new HttpError('Refund not allowed', HttpStatusCode.BAD_REQUEST);
        }

        if (shouldRefund) {
          let refundSuccess = false;

          if (payment.stripePaymentIntentId) {
            refundSuccess = await this.stripeProvider.refund(
              payment.stripePaymentIntentId,
            );
          } else if (payment.paypalCaptureId) {
            refundSuccess = await this.paypalProvider.refund(
              payment.paypalCaptureId,
            );
          }

          if (refundSuccess) {
            await this.paymentWriteRepo.updateStatus(
              payment.paymentId!,
              PaymentStatus.REFUNDED,
            );
          } else {
            throw new HttpError('Refund failed', HttpStatusCode.BAD_REQUEST);
          }
        }
      }
    }
    // 4. Mark Booking as Cancelled
    await this.bookingRepo.markAsCancelled(bookingId, cancelledBy);

    // 5. Free up status (Mark slot available)
    if (booking.slotId) {
      const slot = await this.slotRepo.findById(booking.slotId);
      if (slot && slot.slotId) {
        await this.slotRepo.updateStatus(slot.slotId, SlotStatus.AVAILABLE);
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
