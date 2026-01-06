import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';
import { CourseModel } from '../../../course/infrastructure/models/CourseModel';
import { StudentModel } from '../../../student/infrastructure/models/StudentModel';
import { IInitiateEnrollmentPayment } from '../interfaces/IInitiateEnrollmentPayment';
import { InitiatePaymentUseCase } from '../../../payment/application/use-cases/InitiatePaymentUseCase';
import { PaymentInitiationResponse } from '../../../../shared/services/payment/interfaces/IPaymentProvider';

export class InitiateEnrollmentPaymentUseCase
  implements IInitiateEnrollmentPayment
{
  constructor(
    private _enrollmentReadRepo: IEnrollmentReadRepository,
    private _initiatePaymentUc: InitiatePaymentUseCase,
  ) {}

  async execute(
    userId: string,
    courseId: string,
    providerName: string,
  ): Promise<{
    providerResponse: PaymentInitiationResponse;
    paymentId: string;
  }> {
    // 1. Fetch course details
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // 1.1 Fetch student details
    const student = await StudentModel.findById(userId);
    if (!student) {
      throw new Error('Student not found');
    }

    // 2. Check if already enrolled
    const enrollment = await this._enrollmentReadRepo.findEnrollment(
      userId,
      courseId,
    );
    if (enrollment) {
      throw new Error('Already enrolled in this course');
    }

    // 3. Initiate payment via Payment Module
    return await this._initiatePaymentUc.execute({
      userId,
      courseId,
      instructorId: course.instructorId.toString(),
      amount: course.price,
      currency: 'INR',
      providerName,
      productName: course.title,
      productImage: course.thumbnailUrl || undefined,
      studentName: student.name,
      studentEmail: student.email,
    });
  }
}
