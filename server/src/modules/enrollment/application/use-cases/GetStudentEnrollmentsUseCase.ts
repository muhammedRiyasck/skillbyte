import { IGetStudentEnrollmentsUseCase } from '../interfaces/IGetStudentEnrollments';
import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';
import { EnrollmentStatus } from '../../../../shared/enums/EnrollmentStatus';
import { StudentEnrollmentsResponseDto } from '../dtos/StudentEnrollmentsResponseDto';
import { IStudentEnrollment } from '../../types/IStudentEnrollment';

export class GetStudentEnrollmentsUseCase
  implements IGetStudentEnrollmentsUseCase
{
  constructor(private enrollmentRepository: IEnrollmentReadRepository) {}

  async execute(
    userId: string,
    page: number,
    limit: number,
    filters?: {
      search?: string;
      status?: EnrollmentStatus;
    },
  ): Promise<StudentEnrollmentsResponseDto> {
    const result = (await this.enrollmentRepository.findEnrollmentsByUser(
      userId,
      page,
      limit,
      filters,
    )) as { data: IStudentEnrollment[]; totalCount: number };

    return {
      data: result.data,
      totalCount: result.totalCount,
    };
  }
}
