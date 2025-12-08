import { IEnrollment } from "../infrastructure/models/EnrollmentModel";
import { IPayment } from "../infrastructure/models/PaymentModel";

export interface IEnrollmentRepository {
  createEnrollment(enrollmentData: Partial<IEnrollment>): Promise<IEnrollment>;
  findEnrollment(userId: string, courseId: string): Promise<IEnrollment | null>;
  updateEnrollmentStatus(enrollmentId: string, status: string): Promise<IEnrollment | null>;
  createPayment(paymentData: Partial<IPayment>): Promise<IPayment>;
  findPaymentByIntentId(paymentIntentId: string): Promise<IPayment | null>;
  updatePaymentStatus(paymentIntentId: string, status: string): Promise<IPayment | null>;
}
