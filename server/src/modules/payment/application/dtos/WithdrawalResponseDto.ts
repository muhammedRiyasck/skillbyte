import { WithdrawalStatus } from '../../domain/entities/Withdrawal';

export interface WithdrawalResponseDto {
  withdrawalId: string;
  instructorId: string;
  amount: number;
  currency: string;
  status: WithdrawalStatus;
  payoutMethod: 'STRIPE';
  transactionId?: string;
  createdAt?: Date;
}
