import { PaymentStatus } from '../../../../shared/enums/PaymentStatus';

export interface PaymentResponseDto {
  id: string;
  courseId?: string;
  mentorshipBookingId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  productName: string;
  productImage?: string;
  createdAt?: Date;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
}
