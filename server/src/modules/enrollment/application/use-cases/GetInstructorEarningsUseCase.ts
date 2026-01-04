import { IPaymentRepository } from '../../domain/IPaymentRepository';
import { IInstructorEarnings } from '../../types/IPaymentHistory';
import { IGetInstructorEarnings } from '../interfaces/IGetInstructorEarnings';

export class GetInstructorEarningsUseCase implements IGetInstructorEarnings {
  constructor(private paymentRepository: IPaymentRepository) {}

  async execute(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<IInstructorEarnings[]> {
    return await this.paymentRepository.findPaymentsByInstructor(
      instructorId,
      page,
      limit,
    );
  }
}
