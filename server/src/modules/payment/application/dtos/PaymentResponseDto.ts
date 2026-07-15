import { PaymentStatus } from '../../../../shared/enums/PaymentStatus';

export interface PaymentResponseDto {
  id: string;
  courseId?: string;
  mentorshipBookingId?: string;
  amount: number;
  instructorAmount?: number;
  adminFee?: number;
  currency: string;
  status: PaymentStatus;
  productName: string;
  productImage?: string;
  studentName?: string;
  createdAt?: Date;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
}
