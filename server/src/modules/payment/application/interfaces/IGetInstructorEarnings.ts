import { GetInstructorEarningsDto } from '../dtos/PaymentDto';
import { PaymentResponseDto } from '../dtos/PaymentResponseDto';

export interface IGetInstructorEarnings {
  execute(dto: GetInstructorEarningsDto): Promise<{
    data: PaymentResponseDto[];
    totalCount: number;
    totalRevenue: number;
    totalProfit: number;
  }>;
}
