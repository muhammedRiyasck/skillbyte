export interface IRefundPaymentUseCase {
  execute(paymentId: string, reason?: string): Promise<boolean>;
}
