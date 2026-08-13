import { WithdrawalResponseMapper } from '../mappers/WithdrawalResponseMapper';
import { RequestWithdrawalDto } from '../dtos/WithdrawalDto';
import { WithdrawalResponseDto } from '../dtos/WithdrawalResponseDto';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { WithdrawalStatus } from '../../domain/entities/Withdrawal';
import { IWithdrawalRepository } from '../../domain/IRepositories/IWithdrawalRepository';
import { IRequestWithdrawal } from '../interfaces/IRequestWithdrawal';

export class RequestWithdrawalUseCase implements IRequestWithdrawal {
  constructor(
    private withdrawalRepo: IWithdrawalRepository,
    private instructorRepo: IInstructorRepository,
  ) {}

  async execute(dto: RequestWithdrawalDto): Promise<WithdrawalResponseDto> {
    const { instructorId, amount } = dto;
    const instructor = await this.instructorRepo.findById(instructorId);
    if (!instructor) {
      throw new HttpError('Instructor not found', HttpStatusCode.NOT_FOUND);
    }

    // Guard: Stripe account must be set up
    if (!instructor.stripeAccountId) {
      throw new HttpError(
        'Please set up your Stripe account for payouts before withdrawing',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Guard: Stripe account must be fully verified
    if (!instructor.isStripeVerified) {
      throw new HttpError(
        'Your Stripe account is not yet verified. Please complete the Stripe verification process before requesting a withdrawal.',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Validate amount
    if (amount <= 0) {
      throw new HttpError(
        'Withdrawal amount must be greater than zero',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Calculate withdrawable balance
    const availableBalance =
      instructor.totalEarnings - instructor.withdrawnAmount;

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

    // Create withdrawal request
    let withdrawal;
    try {
      withdrawal = await this.withdrawalRepo.save({
        instructorId: instructor.instructorId,
        amount: Math.round(amount * 100) / 100,
        currency: 'USD',
        status: WithdrawalStatus.PENDING,
        payoutMethod: 'STRIPE',
        payoutDetails: instructor.stripeAccountId,
      });
    } catch {
      throw new HttpError(
        'You already have a pending withdrawal request. Please wait for it to be processed before making another.',
        HttpStatusCode.CONFLICT,
      );
    }

    return WithdrawalResponseMapper.toResponseDto(withdrawal);
  }
}
