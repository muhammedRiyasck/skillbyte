import { IPayment } from '../../domain/entities/Payment';

export interface ICapturePayPalPayment {
  execute(orderId: string): Promise<{ success: boolean; payment?: IPayment }>;
}
