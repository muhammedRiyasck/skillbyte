import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import {
  PAYMENT_EVENTS,
  PaymentSucceededEvent,
} from '../../../../shared/services/event-bus/PaymentEvents';
import logger from '../../../../shared/utils/Logger';
import { CurrencyConverter } from '../../../../shared/utils/CurrencyConverter';

export class InstructorEarningsService {
  constructor(private instructorRepo: IInstructorRepository) {
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
        `Updating earnings for instructor ${event.instructorId} from payment ${event.paymentId}`,
      );

      const instructor = await this.instructorRepo.findById(event.instructorId);
      if (!instructor) {
        logger.error(
          `Instructor ${event.instructorId} not found for earnings update`,
        );
        return;
      }

      const convertedAmount = CurrencyConverter.convertToUSD(
        event.instructorAmount,
        event.currency,
      );

      const newTotalEarnings =
        (instructor.totalEarnings || 0) + convertedAmount;

      await this.instructorRepo.updateById(event.instructorId, {
        totalEarnings: newTotalEarnings,
      });

      logger.info(
        `Instructor ${event.instructorId} earnings updated. New total: ${newTotalEarnings}`,
      );
    } catch (error) {
      logger.error(
        'Error in InstructorEarningsService.handlePaymentSucceeded:',
        error,
      );
    }
  }

  public unregisterEventListeners() {
    eventBus.off(
      PAYMENT_EVENTS.PAYMENT_SUCCEEDED,
      this.handlePaymentSucceeded.bind(this),
    );
  }
}
