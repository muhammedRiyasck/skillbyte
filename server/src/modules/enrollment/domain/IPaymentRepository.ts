import { IBaseRepository } from '../../../shared/repositories/IBaseRepository';
import { IPayment } from '../infrastructure/models/PaymentModel';
import { IPaymentHistory, IInstructorEarnings } from '../types/IPaymentHistory';

export interface IPaymentRepository extends IBaseRepository<IPayment> {
  createPayment(paymentData: Partial<IPayment>): Promise<IPayment>;
  findPaymentByIntentId(paymentIntentId: string): Promise<IPayment | null>;
  findPaymentByPayPalOrderId(orderId: string): Promise<IPayment | null>;
  updatePaymentStatus(
    paymentIntentId: string,
    status: string,
  ): Promise<IPayment | null>;
  updatePaymentStatusByPayPalOrder(
    orderId: string,
    status: string,
  ): Promise<IPayment | null>;
  findPaymentsByUser(
    userId: string,
    page: number,
    limit: number,
    filters?: { status?: string; startDate?: Date; endDate?: Date },
  ): Promise<IPaymentHistory[]>;
  findPaymentsByInstructor(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<IInstructorEarnings[]>;
}
