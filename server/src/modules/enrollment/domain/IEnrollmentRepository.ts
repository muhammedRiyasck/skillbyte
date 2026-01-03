import { Types } from 'mongoose';
import { IEnrollment } from '../infrastructure/models/EnrollmentModel';
import { IPayment } from '../infrastructure/models/PaymentModel';
import { IInstructorEnrollment } from '../types/IInstructorEnrollment';
import { IEnrollmentFilters } from '../types/IInstructorEnrollment';
import { IPaymentHistory, IInstructorEarnings } from '../types/IPaymentHistory';
import { IStudentEnrollment } from '../types/IStudentEnrollment';
import { IBaseRepository } from '../../../shared/repositories/IBaseRepository';

export interface IEnrollmentRepository extends IBaseRepository<IEnrollment> {
  findEnrollment(userId: string, courseId: string): Promise<IEnrollment | null>;
  findEnrollmentsForUser(
    userId: string,
    courseIds: string[],
  ): Promise<IEnrollment[]>;
  findEnrollmentsByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: IStudentEnrollment[]; totalCount: number }>;
  findEnrollmentsByInstructor(
    instructorId: Types.ObjectId,
    page: number,
    limit: number,
    filters?: IEnrollmentFilters,
  ): Promise<IInstructorEnrollment[]>;
  updateEnrollmentStatus(
    enrollmentId: string,
    status: string,
  ): Promise<IEnrollment | null>;
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
  updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    progressData: {
      lastWatchedSecond: number;
      totalDuration: number;
      isCompleted: boolean;
    },
  ): Promise<IEnrollment | null>;
  findPaymentsByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IPaymentHistory[]>;
  findPaymentsByInstructor(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<IInstructorEarnings[]>;
}
