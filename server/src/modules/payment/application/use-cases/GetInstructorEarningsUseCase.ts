import { IPaymentReadRepository } from '../../domain/IRepositories/IPaymentReadRepository';
import { PaymentResponseMapper } from '../mappers/PaymentResponseMapper';
import { GetInstructorEarningsDto } from '../dtos/PaymentDto';
import { PaymentResponseDto } from '../dtos/PaymentResponseDto';
import { IGetInstructorEarnings } from '../interfaces/IGetInstructorEarnings';

export class GetInstructorEarningsUseCase implements IGetInstructorEarnings {
  constructor(private paymentRepository: IPaymentReadRepository) {}

  async execute(dto: GetInstructorEarningsDto): Promise<{
    data: PaymentResponseDto[];
    totalCount: number;
    totalRevenue: number;
    totalProfit: number;
  }> {
    const { instructorId, page = 1, limit = 10 } = dto;
    const { data, totalCount, totalRevenue, totalProfit } =
      await this.paymentRepository.findPaymentsByInstructor(
        instructorId,
        page,
        limit,
      );

    return {
      data: data.map(PaymentResponseMapper.toResponseDto),
      totalCount,
      totalRevenue,
      totalProfit,
    };
  }
}
