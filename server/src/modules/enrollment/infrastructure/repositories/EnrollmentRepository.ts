import { IEnrollmentRepository } from "../../domain/IEnrollmentRepository";
import { EnrollmentModel, IEnrollment } from "../models/EnrollmentModel";
import { PaymentModel, IPayment } from "../models/PaymentModel";

export class EnrollmentRepository implements IEnrollmentRepository {
  async createEnrollment(enrollmentData: Partial<IEnrollment>): Promise<IEnrollment> {
    return await EnrollmentModel.create(enrollmentData);
  }

  async findEnrollment(userId: string, courseId: string): Promise<IEnrollment | null> {
    return await EnrollmentModel.findOne({ userId, courseId });
  }

  async findEnrollmentsForUser(userId: string, courseIds: string[]): Promise<IEnrollment[]> {
    return await EnrollmentModel.find({ userId, courseId: { $in: courseIds } });
  }

  async updateEnrollmentStatus(enrollmentId: string, status: string): Promise<IEnrollment | null> {
    return await EnrollmentModel.findByIdAndUpdate(enrollmentId, { status }, { new: true });
  }

  async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
    return await PaymentModel.create(paymentData);
  }

  async findPaymentByIntentId(paymentIntentId: string): Promise<IPayment | null> {
    return await PaymentModel.findOne({ stripePaymentIntentId: paymentIntentId });
  }

  async updatePaymentStatus(paymentIntentId: string, status: string): Promise<IPayment | null> {
    return await PaymentModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { status },
      { new: true }
    );
  }
}
