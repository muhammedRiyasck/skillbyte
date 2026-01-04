import { Types } from 'mongoose';
import { IEnrollment } from '../infrastructure/models/EnrollmentModel';

import { IInstructorEnrollment } from '../types/IInstructorEnrollment';
import { IEnrollmentFilters } from '../types/IInstructorEnrollment';

import { IStudentEnrollment } from '../types/IStudentEnrollment';
import { IBaseRepository } from '../../../shared/repositories/IBaseRepository';

export interface IEnrollmentRepository extends IBaseRepository<IEnrollment> {
  findEnrollment(userId: string, courseId: string): Promise<IEnrollment | null>;
  findEnrollmentsForUser(
    userId: string,
    courseIds: string[],
  ): Promise<IEnrollment[]>;
  findEnrollmentsByUser(
    userId: string,
    page: number,
    limit: number,
    filters?: {
      search?: string;
      status?: 'active' | 'completed';
    },
  ): Promise<{ data: IStudentEnrollment[]; totalCount: number }>;
  findEnrollmentsByInstructor(
    instructorId: Types.ObjectId,
    page: number,
    limit: number,
    filters?: IEnrollmentFilters,
  ): Promise<IInstructorEnrollment[]>;
  updateEnrollmentStatus(
    enrollmentId: string,
    status: string,
  ): Promise<IEnrollment | null>;

  updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    progressData: {
      lastWatchedSecond: number;
      totalDuration: number;
      isCompleted: boolean;
    },
  ): Promise<IEnrollment | null>;

}
