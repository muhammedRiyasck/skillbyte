export interface IPayment {
  paymentId?: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  metadata?: Record<string, unknown>;
  productName: string;
  productImage?: string;
  instructorId: string;
  adminFee: number;
  instructorAmount: number;
  convertedAmount?: number;
  convertedCurrency?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
