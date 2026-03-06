import { Types } from 'mongoose';
import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';
import { IEnrollment } from '../entities/Enrollment';
import { IInstructorEnrollment } from '../../types/IInstructorEnrollment';
import { IStudentEnrollment } from '../../types/IStudentEnrollment';
import { IEnrollmentFilters } from '../../types/IInstructorEnrollment';

export interface IEnrollmentReadRepository {
  findEnrollment(userId: string, courseId: string): Promise<IEnrollment | null>;
  findStudentIdsByCourseId(courseId: string): Promise<string[]>;
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
      status?: EnrollmentStatus;
    },
  ): Promise<{ data: IStudentEnrollment[]; totalCount: number }>;
  findEnrollmentsByInstructor(
    instructorId: Types.ObjectId,
    page: number,
    limit: number,
    filters?: IEnrollmentFilters,
  ): Promise<IInstructorEnrollment[]>;
}
