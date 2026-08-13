import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';
import { IEnrollmentWriteRepository } from '../../domain/IRepositories/IEnrollmentWriteRepository';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IEnrollFreeCourseUseCase } from '../interfaces/IEnrollFreeCourse';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import { COURSE_EVENTS } from '../../../../shared/services/event-bus/CourseEvents';
import logger from '../../../../shared/utils/Logger';

export class EnrollFreeCourseUseCase implements IEnrollFreeCourseUseCase {
  constructor(
    private _enrollmentReadRepo: IEnrollmentReadRepository,
    private _enrollmentWriteRepo: IEnrollmentWriteRepository,
    private _courseRepo: ICourseRepository,
  ) {}

  async execute(
    userId: string,
    courseId: string,
  ): Promise<{ enrollmentId: string }> {
    // 1. Fetch course
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

    // 2. Verify course is actually free
    if (course.price !== 0) {
      throw new HttpError(
        'This course is not free. Please use the payment flow.',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // 3. Check for duplicate enrollment
    const existing = await this._enrollmentReadRepo.findEnrollment(
      userId,
      courseId,
    );
    if (existing) {
      throw new HttpError(
        'Already enrolled in this course',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // 4. Create enrollment directly (no payment needed)
    const enrollment = await this._enrollmentWriteRepo.save({
      userId,
      courseId,
      paymentId: undefined,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(),
      progress: 0,
      lessonProgress: [],
    });

    logger.info(
      `Free enrollment created for user ${userId} and course ${courseId}`,
    );

    // 5. Emit enrollment created event to notify the instructor
    eventBus.emit(COURSE_EVENTS.ENROLLMENT_CREATED, {
      courseId,
      courseTitle: course.title,
      studentId: userId,
      instructorId: course.instructorId,
    });

    return { enrollmentId: enrollment.enrollmentId! };
  }
}
