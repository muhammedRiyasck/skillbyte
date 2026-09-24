import { eventBus } from '../../../../../shared/services/event-bus/EventBus';
import {
  PAYMENT_EVENTS,
  PaymentSucceededEvent,
  PaymentFailedEvent,
} from '../../../../../shared/services/event-bus/PaymentEvents';
import { ICreateNotificationUseCase } from '../../../application/interfaces/ICreateNotificationUseCase';
import logger from '../../../../../shared/utils/Logger';
import { NotificationType } from '../../../../../shared/enums/NotificationType';

/** Handles payment notification listener functionality. */
export class PaymentNotificationListener {
  constructor(private createNotificationUseCase: ICreateNotificationUseCase) {
    this.registerListeners();
  }

  private registerListeners(): void {
    eventBus.on(
      PAYMENT_EVENTS.PAYMENT_SUCCEEDED,
      this.onPaymentSucceeded.bind(this),
    );
    eventBus.on(PAYMENT_EVENTS.PAYMENT_FAILED, this.onPaymentFailed.bind(this));
    logger.info('PaymentNotificationListener registered');
  }

  private async onPaymentSucceeded(
    event: PaymentSucceededEvent,
  ): Promise<void> {
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
        'PaymentNotificationListener: onPaymentSucceeded failed',
        error,
      );
    }
  }

  private async onPaymentFailed(payload: unknown): Promise<void> {
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
      logger.error(
        'PaymentNotificationListener: onPaymentFailed failed',
        error,
      );
    }
  }
}
