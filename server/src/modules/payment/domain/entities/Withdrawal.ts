export enum WithdrawalStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IWithdrawal {
  withdrawalId?: string;
  instructorId: string;
  amount: number;
  currency: string;
  status: WithdrawalStatus;
  payoutMethod: 'STRIPE';
  payoutDetails: string; // Stripe Account ID
  transactionId?: string;
  notes?: string;
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
