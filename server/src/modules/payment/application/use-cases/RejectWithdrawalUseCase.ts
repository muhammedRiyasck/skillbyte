import { IWithdrawalRepository } from '../../domain/IRepositories/IWithdrawalRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { WithdrawalStatus } from '../../infrastructure/models/WithdrawalModel';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import { WITHDRAWAL_EVENTS } from '../../../../shared/services/event-bus/WithdrawalEvents';
import { IRejectWithdrawal } from '../interfaces/IRejectWithdrawal';

export class RejectWithdrawalUseCase implements IRejectWithdrawal {
  constructor(private withdrawalRepo: IWithdrawalRepository) {}

  async execute(withdrawalId: string, adminNotes: string): Promise<void> {
    if (!adminNotes || adminNotes.trim().length === 0) {
      throw new HttpError(
        'Admin notes (reason for rejection) are required',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const withdrawal = await this.withdrawalRepo.findById(withdrawalId);
    if (!withdrawal) {
      throw new HttpError(
        'Withdrawal request not found',
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new HttpError(
        `Cannot reject withdrawal in ${withdrawal.status} status`,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    await this.withdrawalRepo.updateStatus(
      withdrawalId,
      WithdrawalStatus.REJECTED,
      undefined,
      adminNotes,
    );

    // 4. Emit event for notifications and real-time updates
    eventBus.emit(WITHDRAWAL_EVENTS.WITHDRAWAL_REJECTED, {
      withdrawalId,
      instructorId: withdrawal.instructorId.toString(),
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      status: WithdrawalStatus.REJECTED,
      adminNotes,
    });
  }
}
