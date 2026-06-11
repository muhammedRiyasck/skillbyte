import { IWithdrawal } from '../../domain/entities/Withdrawal';
import { WithdrawalResponseDto } from '../dtos/WithdrawalResponseDto';

export class WithdrawalResponseMapper {
  static toResponseDto(withdrawal: IWithdrawal): WithdrawalResponseDto {
    return {
      withdrawalId: withdrawal.withdrawalId!,
      instructorId: withdrawal.instructorId,
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      status: withdrawal.status,
      payoutMethod: withdrawal.payoutMethod,
      transactionId: withdrawal.transactionId,
      createdAt: withdrawal.createdAt,
    };
  }
}
