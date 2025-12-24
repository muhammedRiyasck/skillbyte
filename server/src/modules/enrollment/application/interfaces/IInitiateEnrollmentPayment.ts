interface OrderResponse {
  id: string;
  client_secret?: string;
}

export interface IInitiateEnrollmentPayment {
  execute(
    userId: string,
    courseId: string,
    providerName: string,
  ): Promise<{ providerResponse: OrderResponse; paymentId: string }>;
}
