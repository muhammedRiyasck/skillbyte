import { IStudentEnrollment } from '../../types/IStudentEnrollment';
import { IGetStudentEnrollmentsUseCase } from '../interfaces/IGetStudentEnrollments';
import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';

export class GetStudentEnrollmentsUseCase
  implements IGetStudentEnrollmentsUseCase
{
  constructor(private enrollmentRepository: IEnrollmentRepository) {}

  async execute(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: IStudentEnrollment[]; totalCount: number }> {
    return await this.enrollmentRepository.findEnrollmentsByUser(
      userId,
      page,
      limit,
    );
  }
}
