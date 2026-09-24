import { eventBus } from '../../../../../shared/services/event-bus/EventBus';
import {
  MENTORSHIP_EVENTS,
  MentorshipBookingCreatedEvent,
  MentorshipBookingConfirmedEvent,
  MentorshipBookingCancelledEvent,
} from '../../../../../shared/services/event-bus/MentorshipEvents';
import { ICreateNotificationUseCase } from '../../../application/interfaces/ICreateNotificationUseCase';
import logger from '../../../../../shared/utils/Logger';
import {
  CancelledBy,
  BookingStatus,
} from '../../../../mentorship/domain/entities/MentorshipBooking';
import { NotificationType } from '../../../../../shared/enums/NotificationType';

/** Handles mentorship notification listener functionality. */
export class MentorshipNotificationListener {
  constructor(private createNotificationUseCase: ICreateNotificationUseCase) {
    this.registerListeners();
  }

  private registerListeners(): void {
    eventBus.on(
      MENTORSHIP_EVENTS.BOOKING_CREATED,
      this.onBookingCreated.bind(this),
    );
    eventBus.on(
      MENTORSHIP_EVENTS.BOOKING_CONFIRMED,
      this.onBookingConfirmed.bind(this),
    );
    eventBus.on(
      MENTORSHIP_EVENTS.BOOKING_CANCELLED,
      this.onBookingCancelled.bind(this),
    );
    logger.info('MentorshipNotificationListener registered');
  }

  private async onBookingCreated(payload: unknown): Promise<void> {
    const event = payload as MentorshipBookingCreatedEvent;
    try {
      await this.createNotificationUseCase.execute({
        userId: event.instructorId,
        title: 'New Mentorship Booking',
        message: 'A student has booked a mentorship session with you.',
        type: NotificationType.INFO,
      });
    } catch (error) {
      logger.error(
        'MentorshipNotificationListener: onBookingCreated failed',
        error,
      );
    }
  }

  private async onBookingConfirmed(payload: unknown): Promise<void> {
    const event = payload as MentorshipBookingConfirmedEvent;
    try {
      await this.createNotificationUseCase.execute({
        userId: event.studentId,
        title: 'Booking Confirmed',
        message:
          'Your mentorship session has been confirmed! Check your bookings for details.',
        type: NotificationType.SUCCESS,
      });

      await this.createNotificationUseCase.execute({
        userId: event.instructorId,
        title: 'Booking Confirmed',
        message:
          'A mentorship session booking has been confirmed. Check your bookings for details.',
        type: NotificationType.SUCCESS,
      });
    } catch (error) {
      logger.error(
        'MentorshipNotificationListener: onBookingConfirmed failed',
        error,
      );
    }
  }

  private async onBookingCancelled(payload: unknown): Promise<void> {
    const event = payload as MentorshipBookingCancelledEvent;
    try {
      if (event.previousStatus === BookingStatus.PENDING) {
        return;
      }

      if (event.cancelledBy === CancelledBy.STUDENT) {
        await this.createNotificationUseCase.execute({
          userId: event.instructorId,
          title: 'Booking Cancelled',
          message: 'A student has cancelled their mentorship session with you.',
          type: NotificationType.WARNING,
        });
      } else {
        await this.createNotificationUseCase.execute({
          userId: event.studentId,
          title: 'Booking Cancelled',
          message:
            'Your instructor has cancelled the mentorship session. A refund has been initiated.',
          type: NotificationType.WARNING,
        });
      }
    } catch (error) {
      logger.error(
        'MentorshipNotificationListener: onBookingCancelled failed',
        error,
      );
    }
  }
}
