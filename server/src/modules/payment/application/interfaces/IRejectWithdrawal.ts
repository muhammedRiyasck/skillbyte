import { RejectWithdrawalDto } from '../dtos/WithdrawalDto';
import { WithdrawalResponseDto } from '../dtos/WithdrawalResponseDto';

export interface IRejectWithdrawal {
  execute(dto: RejectWithdrawalDto): Promise<WithdrawalResponseDto>;
}
