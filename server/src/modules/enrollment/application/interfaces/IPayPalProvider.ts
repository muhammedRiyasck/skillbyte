export interface PayPalCaptureResponse {
  id: string;
  status: string;
}

export interface IPayPalProvider {
  createOrder(amount: number, currency: string): Promise<{ id: string }>;
  capturePayment(orderId: string): Promise<PayPalCaptureResponse>;
}
