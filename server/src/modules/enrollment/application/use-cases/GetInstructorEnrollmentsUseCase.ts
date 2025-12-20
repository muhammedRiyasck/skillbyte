import mongoose from 'mongoose';
import { IGetInstructorEnrollmentsUseCase } from '../interfaces/IGetInstructorEnrollments';
import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';
import { ICourseEnrollmentSummary } from '../../types/IInstructorEnrollment';

export class GetInstructorEnrollmentsUseCase
  implements IGetInstructorEnrollmentsUseCase
{
  constructor(private enrollmentRepository: IEnrollmentRepository) {}

  async execute(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<ICourseEnrollmentSummary> {
    const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
    const result = await this.enrollmentRepository.findEnrollmentsByInstructor(
      instructorObjectId,
      page,
      limit,
    );

    const enrollments = result[0]?.data || [];
    const totalCount = result[0]?.totalCount[0]?.count || 0;

    // Group enrollments by course and enrich with course/student data
    const courseMap = new Map<string, ICourseEnrollmentSummary['data'][0]>();

    for (const enrollment of enrollments) {
      const courseId = enrollment.courseId._id.toString();

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseId,
          courseTitle: enrollment.courseId.title,
          courseThumbnail: enrollment.courseId.thumbnailUrl,
          coursePrice: enrollment.courseId.price,
          enrollments: [],
        });
      }

      const courseSummary = courseMap.get(courseId);
      if (courseSummary) {
        courseSummary.enrollments.push({
          studentId: enrollment.userId._id,
          studentName: enrollment.userId.name,
          studentEmail: enrollment.userId.email,
          enrollmentDate: enrollment.enrolledAt,
          status: enrollment.status,
          progress: enrollment.progress,
        });
      }
    }
    return { data: Array.from(courseMap.values()), totalCount };
  }
}
