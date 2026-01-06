import { IEnrollment } from '../../domain/entities/Enrollment';

export class EnrollmentMapper {
  static toResponse(enrollment: IEnrollment) {
    return {
      id: enrollment.enrollmentId,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      paymentId: enrollment.paymentId,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      progress: enrollment.progress,
      lessonProgress: enrollment.lessonProgress,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    };
  }

  static toResponseList(enrollments: IEnrollment[]) {
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
