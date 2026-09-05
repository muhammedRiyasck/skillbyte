export interface PaymentInitiationResponse {
  id: string;
  client_secret?: string;
}

export interface NormalizedPaymentAmount {
  chargeAmount: number;
  chargeCurrency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
}

export interface IPaymentProvider {
  initiate(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<PaymentInitiationResponse>;

  normalizeAmount(amount: number, currency: string): NormalizedPaymentAmount;

  mapProviderTransactionId(responseId: string): Record<string, string>;

  refund(paymentId: string): Promise<boolean>;

  payout(
    amount: number,
    currency: string,
    destination: string, // Stripe Account ID or PayPal Email
  ): Promise<string>;

  validateDestination(
    destination: string,
  ): Promise<{ isValid: boolean; reason?: string }>;

  validateBalance(
    amount: number,
    currency: string,
  ): Promise<{
    isAvailable: boolean;
    reason?: string;
    availableAmount?: number;
  }>;
}
