import { IPayment } from '../../domain/entities/Payment';

export interface IGetUserPurchases {
  execute(
    userId: string,
    page: number,
    limit: number,
    filters?: { status?: string; startDate?: Date; endDate?: Date },
  ): Promise<{ data: IPayment[]; totalCount: number }>;
}
