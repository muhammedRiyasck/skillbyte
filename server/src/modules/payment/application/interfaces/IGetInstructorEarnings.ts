import { IPayment } from '../../domain/entities/Payment';

export interface IGetInstructorEarnings {
  execute(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: IPayment[];
    totalCount: number;
    totalRevenue: number;
    totalProfit: number;
  }>;
}
