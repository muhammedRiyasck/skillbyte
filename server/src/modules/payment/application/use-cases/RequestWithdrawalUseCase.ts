import { IWithdrawalRepository } from '../../domain/IRepositories/IWithdrawalRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { WithdrawalStatus } from '../../infrastructure/models/WithdrawalModel';
import { IRequestWithdrawal } from '../interfaces/IRequestWithdrawal';

export class RequestWithdrawalUseCase implements IRequestWithdrawal {
  constructor(
    private withdrawalRepo: IWithdrawalRepository,
    private instructorRepo: IInstructorRepository,
  ) {}

  async execute(instructorId: string, amount: number): Promise<void> {
    const instructor = await this.instructorRepo.findById(instructorId);
    if (!instructor) {
      throw new HttpError('Instructor not found', HttpStatusCode.NOT_FOUND);
    }

    // Calculate withdrawable balance
    const availableBalance =
      instructor.totalEarnings - instructor.withdrawnAmount;

    if (amount <= 0) {
      throw new HttpError(
        'Withdrawal amount must be greater than zero',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (amount > availableBalance) {
      throw new HttpError(
        'Insufficient balance for withdrawal',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Idempotency: block if a pending/processing withdrawal already exists
    const alreadyPending =
      await this.withdrawalRepo.hasPendingWithdrawal(instructorId);
    if (alreadyPending) {
      throw new HttpError(
        'You already have a pending withdrawal request. Please wait for it to be processed before making another.',
        HttpStatusCode.CONFLICT,
      );
    }

    // Determine payout method: Stripe is now the only supported platform
    let payoutMethod: 'STRIPE' | null = null;
    let payoutDetails: string | null = null;

    if (instructor.stripeAccountId) {
      payoutMethod = 'STRIPE';
      payoutDetails = instructor.stripeAccountId;
    }

    if (!payoutMethod || !payoutDetails) {
      throw new HttpError(
        'Please set up your Stripe account for payouts before withdrawing',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Create withdrawal request
    await this.withdrawalRepo.save({
      instructorId: instructor.instructorId,
      amount,
      currency: 'USD',
      status: WithdrawalStatus.PENDING,
      payoutMethod,
      payoutDetails,
    });
  }
}
