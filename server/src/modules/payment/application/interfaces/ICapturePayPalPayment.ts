export interface ICapturePayPalPayment {
  execute(orderId: string): Promise<{ success: boolean }>;
}
