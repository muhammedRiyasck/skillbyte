import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';
import { CourseModel } from '../../../course/infrastructure/models/CourseModel';
import { StudentModel } from '../../../student/infrastructure/models/StudentModel';
import { IInitiateEnrollmentPaymentUseCase } from '../interfaces/IInitiateEnrollmentPayment';
import { InitiatePaymentUseCase } from '../../../payment/application/use-cases/InitiatePaymentUseCase';
import { PaymentInitiationResponse } from '../../../../shared/services/payment/interfaces/IPaymentProvider';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class InitiateEnrollmentPaymentUseCase
  implements IInitiateEnrollmentPaymentUseCase
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
      throw new HttpError('Course not found', HttpStatusCode.NOT_FOUND);
    }

    if (course.status !== 'list' || course.isBlocked) {
      throw new HttpError(
        'This course is currently unavailable for enrollment',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // 1.1 Fetch student details
    const student = await StudentModel.findById(userId);
    if (!student) {
      throw new HttpError('Student not found', HttpStatusCode.NOT_FOUND);
    }

    // 2. Check if already enrolled
    const enrollment = await this._enrollmentReadRepo.findEnrollment(
      userId,
      courseId,
    );
    if (enrollment) {
      throw new HttpError(
        'Already enrolled in this course',
        HttpStatusCode.BAD_REQUEST,
      );
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
