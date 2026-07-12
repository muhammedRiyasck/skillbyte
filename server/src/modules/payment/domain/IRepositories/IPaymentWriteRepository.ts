import { IPayment } from '../entities/Payment';

export interface IPaymentWriteRepository {
  createPayment(paymentData: Partial<IPayment>): Promise<IPayment>;
  updatePaymentStatus(
    paymentId: string,
    status: 'pending' | 'succeeded' | 'failed' | 'refunded',
  ): Promise<IPayment | null>;
  updatePaymentStatusByPayPalOrder(
    orderId: string,
    status: 'pending' | 'succeeded' | 'failed',
  ): Promise<IPayment | null>;
  updatePayPalCaptureId(orderId: string, captureId: string): Promise<void>;
  updateStatus(paymentId: string, status: string): Promise<void>;
  updatePaymentDetails(
    paymentId: string,
    paymentData: Partial<IPayment>,
  ): Promise<IPayment | null>;
}
