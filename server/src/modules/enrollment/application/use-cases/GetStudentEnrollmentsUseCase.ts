import { IStudentEnrollment } from '../../types/IStudentEnrollment';
import { IGetStudentEnrollmentsUseCase } from '../interfaces/IGetStudentEnrollments';
import { IEnrollmentReadRepository } from '../../domain/IRepositories/IEnrollmentReadRepository';

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
      status?: 'active' | 'completed';
    },
  ): Promise<{ data: IStudentEnrollment[]; totalCount: number }> {
    return (await this.enrollmentRepository.findEnrollmentsByUser(
      userId,
      page,
      limit,
      filters,
    )) as { data: IStudentEnrollment[]; totalCount: number };
  }
}
