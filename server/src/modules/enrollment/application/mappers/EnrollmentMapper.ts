import { IEnrollment } from '../../domain/entities/Enrollment';
import { EnrollmentResponseDto } from '../dtos/EnrollmentResponseDto';

/** Handles enrollment mapper functionality. */
export class EnrollmentMapper {
  /**
   * To dto for the EnrollmentMapper entity.
   *
   * @param entity - The entity information.
   * @returns The standardized HTTP response.
   */
  static toDto(entity: IEnrollment): EnrollmentResponseDto {
    return {
      enrollmentId: entity.enrollmentId!,
      userId: entity.userId,
      courseId: entity.courseId,
      paymentId: entity.paymentId,
      status: entity.status,
      enrolledAt: entity.enrolledAt,
      completedAt: entity.completedAt,
      progress: Math.min(100, entity.progress),
      lessonProgress: entity.lessonProgress.map((lp) => ({
        lessonId: lp.lessonId,
        lastWatchedSecond: lp.lastWatchedSecond,
        totalDuration: lp.totalDuration,
        isCompleted: lp.isCompleted,
        lastUpdated: lp.lastUpdated,
      })),
    };
  }
}
