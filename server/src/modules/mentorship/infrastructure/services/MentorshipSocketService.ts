import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import { SocketService } from '../../../../shared/services/socket-service.ts/SocketService'; // Using the weird path I found
import {
  MENTORSHIP_EVENTS,
  MentorshipBookingCreatedEvent,
  MentorshipBookingConfirmedEvent,
  MentorshipBookingCancelledEvent,
} from '../../../../shared/services/event-bus/MentorshipEvents';
import logger from '../../../../shared/utils/Logger';

export class MentorshipSocketService {
  private socketService: SocketService;

  constructor() {
    this.socketService = SocketService.getInstance();
    this.registerEventListeners();
  }

  private registerEventListeners() {
    eventBus.on(
      MENTORSHIP_EVENTS.BOOKING_CONFIRMED,
      this.handleBookingConfirmed.bind(this),
    );
    eventBus.on(
      MENTORSHIP_EVENTS.BOOKING_CANCELLED,
      this.handleBookingCancelled.bind(this),
    );
    eventBus.on(
      MENTORSHIP_EVENTS.BOOKING_CREATED,
      this.handleBookingCreated.bind(this),
    );
  }

  private handleBookingConfirmed(payload: unknown) {
    const event = payload as MentorshipBookingConfirmedEvent;
    logger.info(`Notifying users of confirmed booking: ${event.bookingId}`);

    // Notify Instructor
    this.socketService.emitToUser(
      event.instructorId,
      'mentorship:booking_confirmed',
      event,
    );

    // Notify Student
    this.socketService.emitToUser(
      event.studentId,
      'mentorship:booking_confirmed',
      event,
    );
  }

  private handleBookingCancelled(payload: unknown) {
    const event = payload as MentorshipBookingCancelledEvent;
    logger.info(`Notifying users of cancelled booking: ${event.bookingId}`);

    this.socketService.emitToUser(
      event.instructorId,
      'mentorship:booking_cancelled',
      event,
    );

    this.socketService.emitToUser(
      event.studentId,
      'mentorship:booking_cancelled',
      event,
    );
  }

  private handleBookingCreated(payload: unknown) {
    const event = payload as MentorshipBookingCreatedEvent;
    this.socketService.emitToUser(
      event.instructorId,
      'mentorship:booking_created', // Payload pending
      event,
    );
  }
}
