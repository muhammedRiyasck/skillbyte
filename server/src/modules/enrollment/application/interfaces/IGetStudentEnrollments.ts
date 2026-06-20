import { StudentEnrollmentsResponseDto } from '../dtos/StudentEnrollmentsResponseDto';
import { StudentEnrollmentItemDto } from '../dtos/StudentEnrollmentsResponseDto';
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
  ): Promise<StudentEnrollmentsResponseDto>;
}

export type { StudentEnrollmentItemDto };
