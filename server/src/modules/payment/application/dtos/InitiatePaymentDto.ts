export interface InitiatePaymentRequest {
  userId: string;
  courseId: string;
  instructorId: string;
  amount: number;
  currency: string;
  providerName: string;
  productName: string;
  productImage?: string;
  studentName: string;
  studentEmail: string;
}
