import { PaymentStatus } from '../../../../shared/enums/PaymentStatus';

export interface PaymentResponseDto {
  paymentId: string;
  courseId?: string;
  mentorshipBookingId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  productName: string;
  productImage?: string;
  createdAt?: Date;
}
