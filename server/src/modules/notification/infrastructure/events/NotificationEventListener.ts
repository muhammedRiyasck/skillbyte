import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import {
  MENTORSHIP_EVENTS,
  MentorshipBookingCreatedEvent,
  MentorshipBookingConfirmedEvent,
  MentorshipBookingCancelledEvent,
} from '../../../../shared/services/event-bus/MentorshipEvents';
import {
  PAYMENT_EVENTS,
  PaymentSucceededEvent,
  PaymentFailedEvent,
} from '../../../../shared/services/event-bus/PaymentEvents';
import {
  COURSE_EVENTS,
  LessonCreatedEvent,
  ModuleCreatedEvent,
  CoursePublishedEvent,
  CourseUnlistedEvent,
  EnrollmentCreatedEvent,
} from '../../../../shared/services/event-bus/CourseEvents';
import { ICreateNotificationUseCase } from '../../application/interfaces/ICreateNotificationUseCase';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import logger from '../../../../shared/utils/Logger';
import { CancelledBy } from '../../../mentorship/domain/entities/MentorshipBooking';
import { NotificationType } from '../../../../shared/enums/NotificationType';

/**
 * Centralized listener that converts domain events into persisted notifications.
 * Each notification is saved to the DB and emitted in real-time via SocketService
 * (handled internally by CreateNotificationUseCase).
 */
export class NotificationEventListener {
  constructor(
    private createNotificationUseCase: ICreateNotificationUseCase,
    private enrollmentReadRepo?: IEnrollmentReadRepository,
  ) {
    this.registerListeners();
  }

  private registerListeners() {
    // Mentorship events
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

    // Payment events
    eventBus.on(
      PAYMENT_EVENTS.PAYMENT_SUCCEEDED,
      this.onPaymentSucceeded.bind(this),
    );
    eventBus.on(PAYMENT_EVENTS.PAYMENT_FAILED, this.onPaymentFailed.bind(this));

    // Course events
    eventBus.on(COURSE_EVENTS.LESSON_CREATED, this.onLessonCreated.bind(this));
    eventBus.on(COURSE_EVENTS.MODULE_CREATED, this.onModuleCreated.bind(this));
    eventBus.on(
      COURSE_EVENTS.COURSE_PUBLISHED,
      this.onCoursePublished.bind(this),
    );
    eventBus.on(
      COURSE_EVENTS.COURSE_UNLISTED,
      this.onCourseUnlisted.bind(this),
    );
    eventBus.on(
      COURSE_EVENTS.ENROLLMENT_CREATED,
      this.onEnrollmentCreated.bind(this),
    );

    logger.info('NotificationEventListener registered all listeners');
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  /**
   * Sends a notification to all enrolled students for a given course.
   */
  private async notifyEnrolledStudents(
    courseId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
  ) {
    if (!this.enrollmentReadRepo) {
      logger.warn(
        'NotificationEventListener: enrollmentReadRepo not provided, skipping bulk notify',
      );
      return;
    }

    const studentIds =
      await this.enrollmentReadRepo.findStudentIdsByCourseId(courseId);

    // Fire all notifications concurrently
    await Promise.allSettled(
      studentIds.map((studentId) =>
        this.createNotificationUseCase.execute({
          userId: studentId,
          title,
          message,
          type,
        }),
      ),
    );
  }

  // ─── Mentorship Handlers ──────────────────────────────────────────

  private async onBookingCreated(payload: unknown) {
    const event = payload as MentorshipBookingCreatedEvent;
    try {
      await this.createNotificationUseCase.execute({
        userId: event.instructorId,
        title: 'New Mentorship Booking',
        message: 'A student has booked a mentorship session with you.',
        type: NotificationType.INFO,
      });
    } catch (error) {
      logger.error('NotificationEventListener: onBookingCreated failed', error);
    }
  }

  private async onBookingConfirmed(payload: unknown) {
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
        'NotificationEventListener: onBookingConfirmed failed',
        error,
      );
    }
  }

  private async onBookingCancelled(payload: unknown) {
    const event = payload as MentorshipBookingCancelledEvent;
    try {
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
        'NotificationEventListener: onBookingCancelled failed',
        error,
      );
    }
  }

  // ─── Payment Handlers ─────────────────────────────────────────────

  private async onPaymentSucceeded(event: PaymentSucceededEvent) {
    try {
      if (event.courseId) {
        await this.createNotificationUseCase.execute({
          userId: event.userId,
          title: 'Payment Successful',
          message:
            'Your payment was successful! You have been enrolled in the course.',
          type: NotificationType.SUCCESS,
        });
      }
    } catch (error) {
      logger.error(
        'NotificationEventListener: onPaymentSucceeded failed',
        error,
      );
    }
  }

  private async onPaymentFailed(payload: unknown) {
    const event = payload as PaymentFailedEvent;
    try {
      await this.createNotificationUseCase.execute({
        userId: event.userId,
        title: 'Payment Failed',
        message:
          event.reason ||
          'Your payment could not be processed. Please try again.',
        type: NotificationType.ERROR,
      });
    } catch (error) {
      logger.error('NotificationEventListener: onPaymentFailed failed', error);
    }
  }

  // ─── Course Handlers ──────────────────────────────────────────────

  private async onLessonCreated(payload: unknown) {
    const event = payload as LessonCreatedEvent;
    try {
      await this.notifyEnrolledStudents(
        event.courseId,
        'New Lesson Available',
        `A new lesson "${event.lessonTitle}" has been added to "${event.courseTitle}".`,
      );
    } catch (error) {
      logger.error('NotificationEventListener: onLessonCreated failed', error);
    }
  }

  private async onModuleCreated(payload: unknown) {
    const event = payload as ModuleCreatedEvent;
    try {
      await this.notifyEnrolledStudents(
        event.courseId,
        'New Module Available',
        `A new module "${event.moduleTitle}" has been added to "${event.courseTitle}".`,
      );
    } catch (error) {
      logger.error('NotificationEventListener: onModuleCreated failed', error);
    }
  }

  private async onCoursePublished(payload: unknown) {
    const event = payload as CoursePublishedEvent;
    try {
      await this.notifyEnrolledStudents(
        event.courseId,
        'Course Published',
        `The course "${event.courseTitle}" is now live and available!`,
        NotificationType.SUCCESS,
      );
    } catch (error) {
      logger.error(
        'NotificationEventListener: onCoursePublished failed',
        error,
      );
    }
  }

  private async onCourseUnlisted(payload: unknown) {
    const event = payload as CourseUnlistedEvent;
    try {
      await this.notifyEnrolledStudents(
        event.courseId,
        'Course Unlisted',
        `The course "${event.courseTitle}" has been unlisted by the instructor.`,
        NotificationType.WARNING,
      );
    } catch (error) {
      logger.error('NotificationEventListener: onCourseUnlisted failed', error);
    }
  }

  private async onEnrollmentCreated(payload: unknown) {
    const event = payload as EnrollmentCreatedEvent;
    try {
      // Notify the instructor about a new enrollment
      await this.createNotificationUseCase.execute({
        userId: event.instructorId,
        title: 'New Student Enrolled',
        message: `A student has enrolled in your course "${event.courseTitle}".`,
        type: NotificationType.SUCCESS,
      });
    } catch (error) {
      logger.error(
        'NotificationEventListener: onEnrollmentCreated failed',
        error,
      );
    }
  }
}
