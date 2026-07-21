import { IPayment } from '../entities/Payment';
import { InstructorEarningsTrendPointDto } from '../../application/dtos/InstructorEarningsTrendPointDto';

export interface IPaymentReadRepository {
  findById(id: string): Promise<IPayment | null>;
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
  findInstructorEarningsTrend(
    instructorId: string,
    days: number,
  ): Promise<InstructorEarningsTrendPointDto[]>;
  findPaymentByUserAndProduct(
    userId: string,
    courseId?: string,
    mentorshipBookingId?: string,
    status?: string,
  ): Promise<IPayment | null>;
}
