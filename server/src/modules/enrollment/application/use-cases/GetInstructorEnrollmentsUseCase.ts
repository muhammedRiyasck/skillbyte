import mongoose from 'mongoose';
import { IGetInstructorEnrollmentsUseCase } from '../interfaces/IGetInstructorEnrollments';
import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';
import { IEnrollmentFilters } from '../../types/IInstructorEnrollment';
import {
  InstructorEnrollmentsResponseDto,
  CourseEnrollmentSummaryDto,
} from '../dtos/InstructorEnrollmentsResponseDto';
import { InstructorEnrollmentFiltersDto } from '../dtos/InstructorEnrollmentFiltersDto';

export class GetInstructorEnrollmentsUseCase
  implements IGetInstructorEnrollmentsUseCase
{
  constructor(private enrollmentRepository: IEnrollmentReadRepository) {}

  async execute(
    instructorId: string,
    page: number,
    limit: number,
    filters?: InstructorEnrollmentFiltersDto,
  ): Promise<InstructorEnrollmentsResponseDto> {
    const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
    const result = await this.enrollmentRepository.findEnrollmentsByInstructor(
      instructorObjectId,
      page,
      limit,
      filters as IEnrollmentFilters,
    );

    const enrollmentData = result[0];
    const enrollments = enrollmentData?.data || [];
    const totalCount = enrollmentData?.totalCount[0]?.count || 0;
    const totalStudents = enrollmentData?.totalStudents[0]?.count || 0;

    const courseMap = new Map<string, CourseEnrollmentSummaryDto>();

    for (const enrollment of enrollments) {
      const courseId = enrollment.courseId._id.toString();

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          id: courseId,
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

    return { data: Array.from(courseMap.values()), totalCount, totalStudents };
  }
}
