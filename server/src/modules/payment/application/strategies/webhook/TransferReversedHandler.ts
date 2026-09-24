import Stripe from 'stripe';
import { IStripeEventHandler } from './IStripeEventHandler';
import { IWithdrawalRepository } from '../../../domain/IRepositories/IWithdrawalRepository';
import { IInstructorRepository } from '../../../../instructor/domain/IRepositories/IInstructorRepository';
import { WithdrawalStatus } from '../../../domain/entities/Withdrawal';
import { eventBus } from '../../../../../shared/services/event-bus/EventBus';
import { WITHDRAWAL_EVENTS } from '../../../../../shared/services/event-bus/WithdrawalEvents';
import logger from '../../../../../shared/utils/Logger';

/** Handles transfer reversed handler functionality. */
export class TransferReversedHandler implements IStripeEventHandler {
  readonly eventType = 'transfer.reversed';

  constructor(
    private withdrawalRepository: IWithdrawalRepository,
    private instructorRepository: IInstructorRepository,
  ) {}

  /**
   * Handle for the TransferReversedHandler entity.
   *
   * @param event - The event information.
   */
  async handle(event: Stripe.Event): Promise<void> {
    const transfer = event.data.object as Stripe.Transfer;

    const withdrawal = await this.withdrawalRepository.findByTransactionId(
      transfer.id,
    );

    if (!withdrawal) {
      logger.warn(
        `Withdrawal record not found for reversed transfer: ${transfer.id}`,
      );
      return;
    }

    if (withdrawal.status === WithdrawalStatus.FAILED) {
      logger.info(
        `Withdrawal ${withdrawal.withdrawalId} is already marked as FAILED`,
      );
      return;
    }

    // 1. Update Withdrawal Status
    await this.withdrawalRepository.updateStatus(
      withdrawal.withdrawalId!,
      WithdrawalStatus.FAILED,
      undefined,
      'Stripe transfer was reversed.',
    );

    // 2. Recover Instructor Balance (only if it was marked as completed/withdrawn)
    if (withdrawal.status === WithdrawalStatus.COMPLETED) {
      await this.instructorRepository.decrementWithdrawnAmount(
        withdrawal.instructorId.toString(),
        withdrawal.amount,
      );
    }

    // 3. Emit event for dashboard/notification
    eventBus.emit(WITHDRAWAL_EVENTS.WITHDRAWAL_FAILED, {
      withdrawalId: withdrawal.withdrawalId!,
      instructorId: withdrawal.instructorId.toString(),
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      status: WithdrawalStatus.FAILED,
      adminNotes: 'Transfer reversed at Stripe.',
    });

    logger.info(
      `Reversed withdrawal ${withdrawal.withdrawalId} and recovered balance.`,
    );
  }
}
