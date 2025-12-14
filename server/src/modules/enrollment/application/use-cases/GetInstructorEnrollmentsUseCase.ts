import mongoose from 'mongoose';
import { IGetInstructorEnrollmentsUseCase } from '../interfaces/IGetInstructorEnrollments';
import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';
import { IInstructorEnrollment } from '../../types/IInstructorEnrollment';

// Type for aggregation result


export class GetInstructorEnrollmentsUseCase implements IGetInstructorEnrollmentsUseCase {
  constructor(private enrollmentRepository: IEnrollmentRepository) {}

  async execute(instructorId: string): Promise<any[]> {

    const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
    const enrollments = await this.enrollmentRepository.findEnrollmentsByInstructor(instructorObjectId) as IInstructorEnrollment[];
    // Group enrollments by course and enrich with course/student data
    const courseMap = new Map();

    for (const enrollment of enrollments) {
      const courseId = enrollment.courseId._id.toString();

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseId,
          courseTitle: enrollment.courseId.title,
          courseThumbnail: enrollment.courseId.thumbnailUrl,
          coursePrice: enrollment.courseId.price,
          enrollments: []
        });
      }

      courseMap.get(courseId).enrollments.push({
        studentId: enrollment.userId._id,
        studentName: enrollment.userId.name,
        studentEmail: enrollment.userId.email,
        enrollmentDate: enrollment.enrolledAt,
        status: enrollment.status,
        progress: enrollment.progress
      });
    }
    return Array.from(courseMap.values());
  }
}
