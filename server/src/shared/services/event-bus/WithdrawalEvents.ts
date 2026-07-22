export interface WithdrawalProcessedEvent {
  withdrawalId: string;
  instructorId: string;
  amount: number;
  currency: string;
  status: string;
  transactionId?: string;
  adminNotes?: string;
}

export const WITHDRAWAL_EVENTS = {
  WITHDRAWAL_COMPLETED: 'withdrawal.completed',
  WITHDRAWAL_REJECTED: 'withdrawal.rejected',
  WITHDRAWAL_PROCESSING: 'withdrawal.processing',
  WITHDRAWAL_FAILED: 'withdrawal.failed',
  WITHDRAWAL_REVERSED: 'withdrawal.reversed',
  INSTRUCTOR_STRIPE_VERIFIED: 'instructor.stripe.verified',
  INSTRUCTOR_STRIPE_RESTRICTED: 'instructor.stripe.restricted',
} as const;
