import { IEnrollmentWriteRepository } from '../../domain/IRepositories/IEnrollmentWriteRepository';
import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import {
  PAYMENT_EVENTS,
  PaymentSucceededEvent,
} from '../../../../shared/services/event-bus/PaymentEvents';
import logger from '../../../../shared/utils/Logger';

export class EnrollmentFulfillmentService {
  constructor(
    private enrollmentReadRepo: IEnrollmentReadRepository,
    private enrollmentWriteRepo: IEnrollmentWriteRepository,
  ) {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    eventBus.on(
      PAYMENT_EVENTS.PAYMENT_SUCCEEDED,
      this.handlePaymentSucceeded.bind(this),
    );
  }

  private async handlePaymentSucceeded(event: PaymentSucceededEvent) {
    try {
      logger.info(
        `Handling payment.succeeded event for payment ${event.paymentId}`,
      );

      // Idempotency check: Check if enrollment already exists
      const existingEnrollment = await this.enrollmentReadRepo.findEnrollment(
        event.userId,
        event.courseId,
      );

      if (existingEnrollment) {
        logger.info(
          `Enrollment already exists for user ${event.userId} and course ${event.courseId}`,
        );
        return;
      }

      // Create enrollment
      await this.enrollmentWriteRepo.save({
        userId: event.userId,
        courseId: event.courseId,
        paymentId: event.paymentId,
        status: 'active',
        enrolledAt: new Date(),
        progress: 0,
        lessonProgress: [],
      });

      logger.info(
        `Enrollment created for user ${event.userId} and course ${event.courseId}`,
      );
    } catch (error) {
      logger.error(
        'Error in EnrollmentFulfillmentService.handlePaymentSucceeded:',
        error,
      );
      // Don't throw - we don't want to break the payment flow
      // Could emit a failure event or send notification here
    }
  }

  public unregisterEventListeners() {
    eventBus.off(
      PAYMENT_EVENTS.PAYMENT_SUCCEEDED,
      this.handlePaymentSucceeded.bind(this),
    );
  }
}
