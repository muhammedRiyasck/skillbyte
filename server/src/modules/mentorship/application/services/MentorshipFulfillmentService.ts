import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import {
  PAYMENT_EVENTS,
  PaymentSucceededEvent,
  PaymentFailedEvent,
} from '../../../../shared/services/event-bus/PaymentEvents';
import {
  MENTORSHIP_EVENTS,
  MentorshipBookingConfirmedEvent,
} from '../../../../shared/services/event-bus/MentorshipEvents';
import logger from '../../../../shared/utils/Logger';
import { BookingStatus } from '../../domain/entities/MentorshipBooking';

import { IGenerateVideoRoomUseCase } from '../interfaces/IBookingUseCases';

export class MentorshipFulfillmentService {
  constructor(
    private bookingRepo: IMentorshipBookingRepository,
    private generateVideoRoomUseCase: IGenerateVideoRoomUseCase,
  ) {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    eventBus.on(
      PAYMENT_EVENTS.PAYMENT_SUCCEEDED,
      this.handlePaymentSucceeded.bind(this),
    );
    eventBus.on(
      PAYMENT_EVENTS.PAYMENT_FAILED,
      this.handlePaymentFailed.bind(this),
    );
  }

  private async handlePaymentSucceeded(event: PaymentSucceededEvent) {
    if (!event.mentorshipBookingId) {
      return; // Not a mentorship payment
    }

    try {
      logger.info(
        `Processing mentorship fulfillment for booking ${event.mentorshipBookingId}`,
      );

      // 1. Update Booking Status to 'confirmed'
      await this.bookingRepo.updateStatus(
        event.mentorshipBookingId,
        BookingStatus.CONFIRMED,
      );

      // 2. Retrieve booking to get details for event (studentId, instructorId, slotId)
      const booking = await this.bookingRepo.findById(
        event.mentorshipBookingId,
      );
      if (!booking) {
        logger.error(`Booking not found: ${event.mentorshipBookingId}`);
        return;
      }

      // 3. Auto-generate Video Room
      await this.generateVideoRoomUseCase.execute(booking.bookingId!);

      // 4. Emit Booking Confirmed Event
      const confirmedEvent: MentorshipBookingConfirmedEvent = {
        bookingId: booking.bookingId!,
        studentId: booking.studentId,
        instructorId: booking.instructorId,
        slotId: booking.slotId,
        paymentId: event.paymentId,
      };

      eventBus.emit(MENTORSHIP_EVENTS.BOOKING_CONFIRMED, confirmedEvent);
      logger.info(
        `Mentorship booking confirmed: ${event.mentorshipBookingId}. emitted ${MENTORSHIP_EVENTS.BOOKING_CONFIRMED}`,
      );
    } catch (error) {
      logger.error(
        'Error in MentorshipFulfillmentService.handlePaymentSucceeded',
        error,
      );
    }
  }

  private async handlePaymentFailed(event: PaymentFailedEvent) {
    logger.warn(
      `Payment failed event received: ${event.paymentId}. Check if mentorship booking needs update.`,
    );
  }
}
