import { eventBus } from '../../../../../shared/services/event-bus/EventBus';
import {
  WITHDRAWAL_EVENTS,
  WithdrawalProcessedEvent,
} from '../../../../../shared/services/event-bus/WithdrawalEvents';
import { ICreateNotificationUseCase } from '../../../application/interfaces/ICreateNotificationUseCase';
import logger from '../../../../../shared/utils/Logger';
import { NotificationType } from '../../../../../shared/enums/NotificationType';

/** Handles withdrawal notification listener functionality. */
export class WithdrawalNotificationListener {
  constructor(private createNotificationUseCase: ICreateNotificationUseCase) {
    this.registerListeners();
  }

  private registerListeners(): void {
    eventBus.on(
      WITHDRAWAL_EVENTS.WITHDRAWAL_COMPLETED,
      this.onWithdrawalCompleted.bind(this),
    );
    eventBus.on(
      WITHDRAWAL_EVENTS.WITHDRAWAL_REJECTED,
      this.onWithdrawalRejected.bind(this),
    );
    eventBus.on(
      WITHDRAWAL_EVENTS.WITHDRAWAL_PROCESSING,
      this.onWithdrawalProcessing.bind(this),
    );
    eventBus.on(
      WITHDRAWAL_EVENTS.WITHDRAWAL_FAILED,
      this.onWithdrawalFailed.bind(this),
    );
    eventBus.on(
      WITHDRAWAL_EVENTS.WITHDRAWAL_REVERSED,
      this.onWithdrawalReversed.bind(this),
    );
    eventBus.on(
      WITHDRAWAL_EVENTS.INSTRUCTOR_STRIPE_VERIFIED,
      this.onInstructorStripeVerified.bind(this),
    );
    eventBus.on(
      WITHDRAWAL_EVENTS.INSTRUCTOR_STRIPE_RESTRICTED,
      this.onInstructorStripeRestricted.bind(this),
    );
    logger.info('WithdrawalNotificationListener registered');
  }

  private async onWithdrawalCompleted(payload: unknown): Promise<void> {
    const event = payload as WithdrawalProcessedEvent;
    try {
      await this.createNotificationUseCase.execute({
        userId: event.instructorId,
        title: 'Withdrawal Completed',
        message: `Your withdrawal of ${event.amount} ${event.currency} has been processed successfully. Transction ID: ${event.transactionId}`,
        type: NotificationType.SUCCESS,
      });
    } catch (error) {
      logger.error(
        'WithdrawalNotificationListener: onWithdrawalCompleted failed',
        error,
      );
    }
  }

  private async onWithdrawalRejected(payload: unknown): Promise<void> {
    const event = payload as WithdrawalProcessedEvent;
    try {
      await this.createNotificationUseCase.execute({
        userId: event.instructorId,
        title: 'Withdrawal Rejected',
        message: `Your withdrawal of ${event.amount} ${event.currency} was rejected. Reason: ${event.adminNotes || 'N/A'}. Funds have been returned to your balance.`,
        type: NotificationType.ERROR,
      });
    } catch (error) {
      logger.error(
        'WithdrawalNotificationListener: onWithdrawalRejected failed',
        error,
      );
    }
  }

  private async onWithdrawalProcessing(payload: unknown): Promise<void> {
    const event = payload as WithdrawalProcessedEvent;
    try {
      await this.createNotificationUseCase.execute({
        userId: event.instructorId,
        title: 'Withdrawal Processing',
        message: `Your withdrawal of ${event.amount} ${event.currency} is now being processed by the admin.`,
        type: NotificationType.INFO,
      });
    } catch (error) {
      logger.error(
        'WithdrawalNotificationListener: onWithdrawalProcessing failed',
        error,
      );
    }
  }

  private async onWithdrawalFailed(payload: unknown): Promise<void> {
    const event = payload as WithdrawalProcessedEvent;
    try {
      await this.createNotificationUseCase.execute({
        userId: event.instructorId,
        title: 'Withdrawal Failed',
        message: `Your withdrawal of ${event.amount} ${event.currency} could not be completed. Reason: ${event.adminNotes || 'Payout failed at the bank level.'}. Funds have been returned to your balance.`,
        type: NotificationType.ERROR,
      });
    } catch (error) {
      logger.error(
        'WithdrawalNotificationListener: onWithdrawalFailed failed',
        error,
      );
    }
  }

  private async onWithdrawalReversed(payload: unknown): Promise<void> {
    const event = payload as WithdrawalProcessedEvent;
    try {
      await this.createNotificationUseCase.execute({
        userId: event.instructorId,
        title: 'Withdrawal Reversed',
        message: `A previous withdrawal of ${event.amount} ${event.currency} was reversed at Stripe. We have adjusted your platform balance accordingly.`,
        type: NotificationType.WARNING,
      });
    } catch (error) {
      logger.error(
        'WithdrawalNotificationListener: onWithdrawalReversed failed',
        error,
      );
    }
  }

  private async onInstructorStripeVerified(payload: unknown): Promise<void> {
    const event = payload as { instructorId: string };
    try {
      await this.createNotificationUseCase.execute({
        userId: event.instructorId,
        title: 'Stripe Identity Verified',
        message:
          'Your identity is fully verified! You can now request payouts from your earnings dashboard.',
        type: NotificationType.INFO,
      });
    } catch (error) {
      logger.error(
        'WithdrawalNotificationListener: onInstructorStripeVerified failed',
        error,
      );
    }
  }

  private async onInstructorStripeRestricted(payload: unknown): Promise<void> {
    const event = payload as { instructorId: string };
    try {
      await this.createNotificationUseCase.execute({
        userId: event.instructorId,
        title: 'Payout Account Restricted',
        message:
          'Your payout account requires attention. Please update your Stripe settings to continue receiving payouts.',
        type: NotificationType.WARNING,
      });
    } catch (error) {
      logger.error(
        'WithdrawalNotificationListener: onInstructorStripeRestricted failed',
        error,
      );
    }
  }
}
