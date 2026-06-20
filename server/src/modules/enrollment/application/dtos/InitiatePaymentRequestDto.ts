export interface InitiatePaymentRequestDto {
  id: string;
  provider: 'stripe' | 'paypal' | 'razorpay';
}
