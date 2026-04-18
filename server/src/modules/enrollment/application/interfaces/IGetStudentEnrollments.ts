import { IStudentEnrollment } from '../../types/IStudentEnrollment';
import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';

export interface IGetStudentEnrollmentsUseCase {
  execute(
    userId: string,
    page: number,
    limit: number,
    filters?: {
      search?: string;
      status?: EnrollmentStatus;
    },
  ): Promise<{ data: IStudentEnrollment[]; totalCount: number }>;
}
