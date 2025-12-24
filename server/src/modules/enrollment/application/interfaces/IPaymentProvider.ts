export interface PaymentInitiationResponse {
  id: string;
  client_secret?: string;
}

export interface IPaymentProvider {
  initiate(
    amount: number,
    currency: string,
    metadata: { userId: string; courseId: string },
  ): Promise<PaymentInitiationResponse>;
}
