export interface InitiatePaymentDto {
  courseId: string;
  provider: 'stripe' | 'paypal';
}

export interface CapturePayPalPaymentDto {
  orderId: string;
}

export interface GetUserPurchasesDto {
  userId: string;
  page?: number;
  limit?: number;
  status?: string;
  dateRange?: string;
}

export interface GetInstructorEarningsDto {
  instructorId: string;
  page?: number;
  limit?: number;
  trendDays?: number;
  search?: string;
  filter?: string;
}
