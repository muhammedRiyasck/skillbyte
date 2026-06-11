import { IWithdrawalRepository } from '../../domain/IRepositories/IWithdrawalRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { WithdrawalResponseMapper } from '../mappers/WithdrawalResponseMapper';
import { ProcessWithdrawalDto } from '../dtos/WithdrawalDto';
import { WithdrawalResponseDto } from '../dtos/WithdrawalResponseDto';
import { WithdrawalStatus } from '../../domain/entities/Withdrawal';
import { PaymentProviderFactory } from '../../../../shared/services/payment/PaymentProviderFactory';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import { WITHDRAWAL_EVENTS } from '../../../../shared/services/event-bus/WithdrawalEvents';
import { IProcessWithdrawal } from '../interfaces/IProcessWithdrawal';

export class ProcessWithdrawalUseCase implements IProcessWithdrawal {
  constructor(
    private withdrawalRepo: IWithdrawalRepository,
    private instructorRepo: IInstructorRepository,
    private paymentProviderFactory: PaymentProviderFactory,
  ) {}

  async execute(
    dto: ProcessWithdrawalDto,
    adminNotes?: string,
  ): Promise<WithdrawalResponseDto> {
    const { withdrawalId } = dto;
    // 1. Mark as processing ATOMICALLY only if it is currently PENDING
    const withdrawal = await this.withdrawalRepo.updateStatusWithCondition(
      withdrawalId,
      WithdrawalStatus.PROCESSING,
      WithdrawalStatus.PENDING,
    );

    if (!withdrawal) {
      throw new HttpError(
        'Withdrawal request not found or already being processed/completed',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // 1b. Emit event for real-time update
    eventBus.emit(WITHDRAWAL_EVENTS.WITHDRAWAL_PROCESSING, {
      withdrawalId,
      instructorId: withdrawal.instructorId.toString(),
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      status: WithdrawalStatus.PROCESSING,
    });

    try {
      let transactionId: string = '';

      const provider = this.paymentProviderFactory.getProvider(
        withdrawal.payoutMethod,
      );

      // 1. Pre-flight check: Is the Stripe account ready to receive payouts?
      const validation = await provider.validateDestination(
        withdrawal.payoutDetails,
      );

      if (!validation.isValid) {
        throw new HttpError(
          validation.reason || 'Payout destination is not ready',
          HttpStatusCode.BAD_REQUEST,
        );
      }

      // 2. Professional Defensive Programming: Check platform balance BEFORE calling Stripe
      // This avoids the 'insufficient_funds' crash and provides a helpful message to the Admin
      const balanceCheck = await provider.validateBalance(
        withdrawal.amount,
        withdrawal.currency,
      );

      if (!balanceCheck.isAvailable) {
        throw new HttpError(
          balanceCheck.reason ||
            'Platform balance is insufficient for this payout',
          HttpStatusCode.BAD_REQUEST,
        );
      }

      // 3. Initiate the REAL REAL payout
      transactionId = await provider.payout(
        withdrawal.amount,
        withdrawal.currency,
        withdrawal.payoutDetails,
      );

      // 4. Mark withdrawal as completed
      await this.withdrawalRepo.updateStatus(
        withdrawalId,
        WithdrawalStatus.COMPLETED,
        transactionId,
        adminNotes,
      );

      // 4. Update instructor's withdrawnAmount
      const instructor = await this.instructorRepo.findById(
        withdrawal.instructorId.toString(),
      );
      if (instructor) {
        const newWithdrawnAmount =
          (instructor.withdrawnAmount || 0) + withdrawal.amount;
        await this.instructorRepo.updateById(instructor.instructorId!, {
          withdrawnAmount: newWithdrawnAmount,
        });
      }

      // 5. Emit event for notifications and real-time updates
      eventBus.emit(WITHDRAWAL_EVENTS.WITHDRAWAL_COMPLETED, {
        withdrawalId,
        instructorId: withdrawal.instructorId.toString(),
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        status: WithdrawalStatus.COMPLETED,
        transactionId,
        adminNotes,
      });

      const updatedWithdrawal =
        await this.withdrawalRepo.findById(withdrawalId);
      return WithdrawalResponseMapper.toResponseDto(updatedWithdrawal!);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      // 🛡️ Privacy & Reliability Guard:
      // If it's a platform liquidity issue (Insufficient Funds), ROLL BACK to PENDING
      // This hides the error from the instructor and allows the admin to try again after topping up.
      const isLiquidityError =
        errorMessage.includes('Insufficient funds') ||
        errorMessage.includes('balance is insufficient');

      if (isLiquidityError) {
        await this.withdrawalRepo.updateStatus(
          withdrawalId,
          WithdrawalStatus.PENDING,
          undefined,
          'Platform processing delay - please wait.', // Generic message for DB
        );

        // Re-throw the original message so the Admin UI sees the real error (toast)
        throw new HttpError(
          `ADMIN ONLY: ${errorMessage}. Instructor sees 'PENDING'.`,
          HttpStatusCode.OK, // Return 200/OK so UI doesn't crash, but sends the error in message
        );
      }

      // For other real failures (e.g., account blocked), mark as FAILED
      await this.withdrawalRepo.updateStatus(
        withdrawalId,
        WithdrawalStatus.FAILED,
        undefined,
        `Error during payout: ${errorMessage}`,
      );
      throw new HttpError(
        `Payout processing failed: ${errorMessage}`,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
