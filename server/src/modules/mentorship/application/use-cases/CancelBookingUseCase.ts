import { ICancelBookingUseCase } from '../interfaces/IBookingUseCases';
import { CancelBookingDto } from '../dtos/BookingDto';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import { MENTORSHIP_EVENTS } from '../../../../shared/services/event-bus/MentorshipEvents';

export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    private bookingRepo: IMentorshipBookingRepository,
    private slotRepo: IMentorshipSlotRepository,
  ) {}

  async execute(dto: CancelBookingDto): Promise<void> {
    const { bookingId, cancelledBy } = dto;

    // 1. Find Booking
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // 2. Check status
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      throw new Error('Booking cannot be cancelled');
    }

    // 3. Mark Booking as Cancelled
    await this.bookingRepo.markAsCancelled(bookingId, cancelledBy);

    // 4. Free up status (Mark slot available)

    if (booking.slotId) {
      const slot = await this.slotRepo.findById(booking.slotId);
      if (slot && slot.slotId) {
        await this.slotRepo.updateStatus(slot.slotId, 'available');
        await this.slotRepo.decrementBookings(slot.slotId);
      }
    }

    // 5. Refund Logic

    // 6. Emit Cancellation Event
    eventBus.emit(MENTORSHIP_EVENTS.BOOKING_CANCELLED, {
      bookingId: booking.bookingId!,
      cancelledBy,
      studentId: booking.studentId,
      instructorId: booking.instructorId,
    });
  }
}
