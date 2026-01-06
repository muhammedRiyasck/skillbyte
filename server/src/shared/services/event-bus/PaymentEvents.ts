export interface PaymentSucceededEvent {
  paymentId: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentFailedEvent {
  paymentId: string;
  userId: string;
  reason?: string;
}

export const PAYMENT_EVENTS = {
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
} as const;
