import { RequestWithdrawalDto } from '../dtos/WithdrawalDto';
import { WithdrawalResponseDto } from '../dtos/WithdrawalResponseDto';

export interface IRequestWithdrawal {
  execute(dto: RequestWithdrawalDto): Promise<WithdrawalResponseDto>;
}
