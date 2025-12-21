import { IPaymentHistory } from '../../types/IPaymentHistory';

export interface IGetUserPurchases {
  execute(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IPaymentHistory[]>;
}
