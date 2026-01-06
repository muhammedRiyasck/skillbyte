import { IPayment } from '../entities/Payment';

export interface IPaymentReadRepository {
  findPaymentByIntentId(paymentIntentId: string): Promise<IPayment | null>;
  findPaymentByPayPalOrderId(orderId: string): Promise<IPayment | null>;
  findPaymentsByUser(
    userId: string,
    page: number,
    limit: number,
    filters?: { status?: string; startDate?: Date; endDate?: Date },
  ): Promise<{ data: IPayment[]; totalCount: number }>;
  findPaymentsByInstructor(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: IPayment[];
    totalCount: number;
    totalRevenue: number;
    totalProfit: number;
  }>;
}
