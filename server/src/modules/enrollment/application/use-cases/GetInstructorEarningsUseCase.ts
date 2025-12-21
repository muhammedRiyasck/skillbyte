import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';
import { IInstructorEarnings } from '../../types/IPaymentHistory';
import { IGetInstructorEarnings } from '../interfaces/IGetInstructorEarnings';

export class GetInstructorEarningsUseCase implements IGetInstructorEarnings {
  constructor(private enrollmentRepository: IEnrollmentRepository) {}

  async execute(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<IInstructorEarnings[]> {
    return await this.enrollmentRepository.findPaymentsByInstructor(
      instructorId,
      page,
      limit,
    );
  }
}
