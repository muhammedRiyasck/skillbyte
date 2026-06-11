export interface RequestWithdrawalDto {
  instructorId: string;
  amount: number;
  payoutMethod: 'STRIPE';
}

export interface ProcessWithdrawalDto {
  withdrawalId: string;
}

export interface RejectWithdrawalDto {
  withdrawalId: string;
  reason: string;
}
