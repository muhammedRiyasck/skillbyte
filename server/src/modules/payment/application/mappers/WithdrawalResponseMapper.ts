import { IWithdrawal } from '../../domain/entities/Withdrawal';
import { WithdrawalResponseDto } from '../dtos/WithdrawalResponseDto';

/** Handles withdrawal response mapper functionality. */
export class WithdrawalResponseMapper {
  /**
   * To response dto for the WithdrawalResponseMapper entity.
   *
   * @param withdrawal - The withdrawal information.
   * @returns The standardized HTTP response.
   */
  static toResponseDto(withdrawal: IWithdrawal): WithdrawalResponseDto {
    return {
      _id: withdrawal.withdrawalId!, // Map to _id for frontend
      withdrawalId: withdrawal.withdrawalId!,
      instructorId: withdrawal.instructorId,
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      status: withdrawal.status,
      payoutMethod: withdrawal.payoutMethod,
      payoutDetails: withdrawal.payoutDetails,
      adminNotes: withdrawal.adminNotes,
      transactionId: withdrawal.transactionId,
      createdAt: withdrawal.createdAt,
    };
  }
}
