import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IStripeProvider } from '../../../../shared/services/payment/interfaces/IStripeProvider';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import logger from '../../../../shared/utils/Logger';
import { ICreateStripeOnboardingLinkUseCase } from '../interfaces/ICreateStripeOnboardingLinkUseCase';

export class CreateStripeOnboardingLinkUseCase
  implements ICreateStripeOnboardingLinkUseCase
{
  constructor(
    private instructorRepo: IInstructorRepository,
    private stripeProvider: IStripeProvider,
  ) {}

  async execute(instructorId: string): Promise<string> {
    const instructor = await this.instructorRepo.findById(instructorId);

    if (!instructor) {
      throw new HttpError('Instructor not found', HttpStatusCode.NOT_FOUND);
    }

    let stripeAccountId = instructor.stripeAccountId;

    // 1. Create Stripe Account if it doesn't exist or is invalid (e.g., contains a MongoDB ID)
    if (!stripeAccountId || !stripeAccountId.startsWith('acct_')) {
      const account = await this.stripeProvider.createAccount(instructor.email);
      stripeAccountId = account.id;

      // Save stripeAccountId to instructor record
      await this.instructorRepo.updateById(instructorId, { stripeAccountId });
      logger.info(
        `Created Stripe Express account ${stripeAccountId} for instructor ${instructorId}`,
      );
    }

    // 2. Check if we can generate a direct Login Link for their Stripe Dashboard
    const account = await this.stripeProvider.retrieveAccount(stripeAccountId);
    if (account.details_submitted) {
      try {
        const loginLink =
          await this.stripeProvider.createLoginLink(stripeAccountId);
        return loginLink.url;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        // If Stripe rejects the login link (common if onboarding isn't "fully" done by their internal checks),
        // we log it and fall back to the regular onboarding link below.
        logger.warn(
          `Could not create login link for account ${stripeAccountId}, falling back to onboarding link: ${message}`,
        );
      }
    }

    // 3. Generate a standard Onboarding/Update Link (Fallback or Initial)
    const returnUrl = `${process.env.FRONTEND_URL}/instructor/?stripe=success`;
    const refreshUrl = `${process.env.FRONTEND_URL}/instructor/?stripe=failed`;

    const accountLink = await this.stripeProvider.createAccountLink(
      stripeAccountId,
      returnUrl,
      refreshUrl,
    );

    return accountLink.url;
  }
}
