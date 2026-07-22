import { IPaymentReadRepository } from '../../domain/IRepositories/IPaymentReadRepository';
import { PaymentResponseMapper } from '../mappers/PaymentResponseMapper';
import { GetInstructorEarningsDto } from '../dtos/PaymentDto';
import { PaymentResponseDto } from '../dtos/PaymentResponseDto';
import { IGetInstructorEarnings } from '../interfaces/IGetInstructorEarnings';
import { InstructorEarningsTrendPointDto } from '../dtos/InstructorEarningsTrendPointDto';

export class GetInstructorEarningsUseCase implements IGetInstructorEarnings {
  constructor(private paymentRepository: IPaymentReadRepository) {}

  async execute(dto: GetInstructorEarningsDto): Promise<{
    data: PaymentResponseDto[];
    totalCount: number;
    totalRevenue: number;
    totalProfit: number;
    trend: InstructorEarningsTrendPointDto[];
  }> {
    const {
      instructorId,
      page = 1,
      limit = 10,
      trendDays = 0,
      search,
      filter,
    } = dto;
    const { data, totalCount, totalRevenue, totalProfit } =
      await this.paymentRepository.findPaymentsByInstructor(
        instructorId,
        page,
        limit,
        { search, filter },
      );

    const dailyTotals = trendDays
      ? await this.paymentRepository.findInstructorEarningsTrend(
          instructorId,
          trendDays,
        )
      : [];
    const totalsByDate = new Map(dailyTotals.map((item) => [item.date, item]));
    const trend = Array.from({ length: trendDays }, (_, index) => {
      const date = new Date();
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCDate(date.getUTCDate() - (trendDays - index - 1));
      const dateKey = date.toISOString().slice(0, 10);

      return (
        totalsByDate.get(dateKey) ?? {
          date: dateKey,
          revenue: 0,
          profit: 0,
          enrollments: 0,
        }
      );
    });

    return {
      data: data.map(PaymentResponseMapper.toResponseDto),
      totalCount,
      totalRevenue,
      totalProfit,
      trend,
    };
  }
}
