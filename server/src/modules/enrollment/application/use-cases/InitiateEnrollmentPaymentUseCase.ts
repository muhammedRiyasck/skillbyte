import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IStudentRepository } from '../../../student/domain/IRepositories/IStudentRepository';
import { IInitiateEnrollmentPaymentUseCase } from '../interfaces/IInitiateEnrollmentPayment';
import { IInitiatePayment } from '../../../payment/application/interfaces/IInitiatePayment';
import { PaymentInitiationResponse } from '../../../../shared/services/payment/interfaces/IPaymentProvider';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';

/** Executes the business logic for initiate enrollment payment. */
export class InitiateEnrollmentPaymentUseCase
  implements IInitiateEnrollmentPaymentUseCase
{
  constructor(
    private _enrollmentReadRepo: IEnrollmentReadRepository,
    private _courseRepo: ICourseRepository,
    private _studentRepo: IStudentRepository,
    private _initiatePaymentUc: IInitiatePayment,
  ) {}

  /**
   * Execute for the InitiateEnrollmentPayment entity.
   *
   * @param userId - The unique identifier for the user.
   * @param courseId - The unique identifier for the course.
   * @param providerName - The unique identifier for the providerName.
   * @returns The standardized HTTP response.
   */
  async execute(
    userId: string,
    courseId: string,
    providerName: string,
  ): Promise<{
    providerResponse: PaymentInitiationResponse;
    paymentId: string;
  }> {
    // 1. Fetch course details via repository interface
    const course = await this._courseRepo.findById(courseId);
    if (!course) {
      throw new HttpError('Course not found', HttpStatusCode.NOT_FOUND);
    }

    if (course.status !== CourseStatus.LIST || course.isBlocked) {
      throw new HttpError(
        'This course is currently unavailable for enrollment',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // 1.1 Fetch student details via repository interface
    const student = await this._studentRepo.findById(userId);
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

    // 3. Initiate payment via Payment Module abstraction
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
