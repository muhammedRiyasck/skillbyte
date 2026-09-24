import Stripe from 'stripe';
import { IStripeEventHandler } from './IStripeEventHandler';
import { IInstructorRepository } from '../../../../instructor/domain/IRepositories/IInstructorRepository';
import { eventBus } from '../../../../../shared/services/event-bus/EventBus';
import { WITHDRAWAL_EVENTS } from '../../../../../shared/services/event-bus/WithdrawalEvents';
import logger from '../../../../../shared/utils/Logger';

/** Handles stripe account updated handler functionality. */
export class StripeAccountUpdatedHandler implements IStripeEventHandler {
  readonly eventType = 'account.updated';

  constructor(private instructorRepository: IInstructorRepository) {}

  /**
   * Handle for the StripeAccountUpdatedHandler entity.
   *
   * @param event - The event information.
   */
  async handle(event: Stripe.Event): Promise<void> {
    const account = event.data.object as Stripe.Account;

    const instructor = await this.instructorRepository.findByStripeAccountId(
      account.id,
    );

    if (!instructor) {
      logger.warn(
        `Stripe account ${account.id} updated, but no matching instructor found in DB.`,
      );
      return;
    }

    const isVerified = account.payouts_enabled;
    logger.info(
      `Instructor ${instructor.instructorId} (${instructor.name}) - payouts_enabled: ${isVerified}`,
    );

    // Only update if status changed
    if (instructor.isStripeVerified !== isVerified) {
      await this.instructorRepository.updateStripeVerificationStatus(
        instructor.instructorId!,
        isVerified,
      );

      if (isVerified) {
        logger.info(
          `Stripe account ${account.id} verified for instructor ${instructor.instructorId!}`,
        );
        eventBus.emit(WITHDRAWAL_EVENTS.INSTRUCTOR_STRIPE_VERIFIED, {
          instructorId: instructor.instructorId!,
        });
      } else {
        logger.warn(
          `Stripe account ${account.id} restricted for instructor ${instructor.instructorId!}`,
        );
        eventBus.emit(WITHDRAWAL_EVENTS.INSTRUCTOR_STRIPE_RESTRICTED, {
          instructorId: instructor.instructorId!,
        });
      }
    }
  }
}
