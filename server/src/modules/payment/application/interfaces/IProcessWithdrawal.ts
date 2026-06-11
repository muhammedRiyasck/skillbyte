import { ProcessWithdrawalDto } from '../dtos/WithdrawalDto';
import { WithdrawalResponseDto } from '../dtos/WithdrawalResponseDto';

export interface IProcessWithdrawal {
  execute(
    dto: ProcessWithdrawalDto,
    adminNotes?: string,
  ): Promise<WithdrawalResponseDto>;
}
