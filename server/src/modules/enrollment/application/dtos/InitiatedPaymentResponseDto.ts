export interface InitiatedPaymentResponseDto {
  providerResponse: {
    id: string;
    client_secret?: string;
  };
  paymentId: string;
}
