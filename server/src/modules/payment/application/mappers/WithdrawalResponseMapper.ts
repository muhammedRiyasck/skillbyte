import { IWithdrawal } from '../../domain/entities/Withdrawal';
import { WithdrawalResponseDto } from '../dtos/WithdrawalResponseDto';

export class WithdrawalResponseMapper {
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
