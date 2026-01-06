import { IPaymentReadRepository } from '../../domain/IRepositories/IPaymentReadRepository';
import { IPayment } from '../../domain/entities/Payment';
import { IGetInstructorEarnings } from '../interfaces/IGetInstructorEarnings';

export class GetInstructorEarningsUseCase implements IGetInstructorEarnings {
  constructor(private paymentRepository: IPaymentReadRepository) {}

  async execute(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: IPayment[];
    totalCount: number;
    totalRevenue: number;
    totalProfit: number;
  }> {
    return await this.paymentRepository.findPaymentsByInstructor(
      instructorId,
      page,
      limit,
    );
  }
}
