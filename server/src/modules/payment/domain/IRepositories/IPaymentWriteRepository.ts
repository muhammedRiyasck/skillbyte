import { IPayment } from '../entities/Payment';

export interface IPaymentWriteRepository {
  createPayment(paymentData: Partial<IPayment>): Promise<IPayment>;
  updatePaymentStatus(
    paymentIntentId: string,
    status: string,
  ): Promise<IPayment | null>;
  updatePaymentStatusByPayPalOrder(
    orderId: string,
    status: string,
  ): Promise<IPayment | null>;
}
