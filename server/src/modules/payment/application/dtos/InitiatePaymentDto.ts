export interface InitiatePaymentDto {
  userId: string;
  courseId?: string;
  mentorshipBookingId?: string;
  instructorId: string;
  amount: number;
  currency: string;
  providerName: string;
  productName: string;
  productImage?: string;
  studentName: string;
  studentEmail: string;
}
