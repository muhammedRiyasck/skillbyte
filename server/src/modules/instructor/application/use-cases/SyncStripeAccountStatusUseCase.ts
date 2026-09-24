import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IStripeProvider } from '../../../../shared/services/payment/interfaces/IStripeProvider';
import { ISyncStripeAccountStatusUseCase } from '../interfaces/ISyncStripeAccountStatusUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import logger from '../../../../shared/utils/Logger';

/** Executes the business logic for sync stripe account status. */
export class SyncStripeAccountStatusUseCase
  implements ISyncStripeAccountStatusUseCase
{
  constructor(
    private instructorRepo: IInstructorRepository,
    private stripeProvider: IStripeProvider,
  ) {}

  /**
   * Execute for the SyncStripeAccountStatus entity.
   *
   * @param instructorId - The unique identifier for the instructor.
   * @returns The result of the operation.
   */
  async execute(instructorId: string): Promise<boolean> {
    const instructor = await this.instructorRepo.findById(instructorId);
    if (!instructor) {
      throw new HttpError('Instructor not found', HttpStatusCode.NOT_FOUND);
    }

    if (!instructor.stripeAccountId) {
      throw new HttpError(
        'Stripe account not set up yet',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    logger.info(
      `Manually syncing Stripe status for instructor ${instructorId}`,
    );

    try {
      const account = await this.stripeProvider.retrieveAccount(
        instructor.stripeAccountId,
      );
      const isVerified = account.payouts_enabled;

      if (instructor.isStripeVerified !== isVerified) {
        await this.instructorRepo.updateStripeVerificationStatus(
          instructorId,
          isVerified,
        );
        logger.info(
          `Updated instructor ${instructorId} verification status to ${isVerified}`,
        );
      } else {
        logger.info(
          `Instructor ${instructorId} verification status is already in sync: ${isVerified}`,
        );
      }

      return isVerified;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(
        `Failed to sync Stripe status for ${instructorId}: ${message}`,
      );
      throw new HttpError(
        `Stripe synchronization failed: ${message}`,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
