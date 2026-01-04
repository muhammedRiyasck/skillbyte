import { IPaymentRepository } from '../../domain/IPaymentRepository';
import { IPaymentHistory } from '../../types/IPaymentHistory';
import { IGetUserPurchases } from '../interfaces/IGetUserPurchases';

export class GetUserPurchasesUseCase implements IGetUserPurchases {
  constructor(private paymentRepository: IPaymentRepository) {}

  async execute(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IPaymentHistory[]> {
    return await this.paymentRepository.findPaymentsByUser(
      userId,
      page,
      limit,
    );
  }
}
