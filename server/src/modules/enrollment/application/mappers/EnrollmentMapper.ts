import { IEnrollment as IEnrollmentEntity } from '../../domain/entities/Enrollment';

export class EnrollmentMapper {
  static toResponse(enrollment: IEnrollmentEntity) {
    return {
      id: enrollment.enrollmentId,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      paymentId: enrollment.paymentId,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      progress: Math.min(100, enrollment.progress),
      lessonProgress: enrollment.lessonProgress,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    };
  }

  static toResponseList(enrollments: IEnrollmentEntity[]) {
    return enrollments.map((enrollment) => this.toResponse(enrollment));
  }

  static toStudentEnrollmentsResponse(data: {
    data: unknown[];
    totalCount: number;
  }) {
    return {
      enrollments: data.data,
      totalCount: data.totalCount,
    };
  }
}
