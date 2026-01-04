import { IPaymentHistory } from '../../types/IPaymentHistory';

export interface IGetUserPurchases {
  execute(
    userId: string,
    page: number,
    limit: number,
    filters?: { status?: string; startDate?: Date; endDate?: Date },
  ): Promise<IPaymentHistory[]>;
}
