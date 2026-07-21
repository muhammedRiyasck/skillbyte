import { GetInstructorEarningsDto } from '../dtos/PaymentDto';
import { PaymentResponseDto } from '../dtos/PaymentResponseDto';
import { InstructorEarningsTrendPointDto } from '../dtos/InstructorEarningsTrendPointDto';

export interface IGetInstructorEarnings {
  execute(dto: GetInstructorEarningsDto): Promise<{
    data: PaymentResponseDto[];
    totalCount: number;
    totalRevenue: number;
    totalProfit: number;
    trend: InstructorEarningsTrendPointDto[];
  }>;
}
