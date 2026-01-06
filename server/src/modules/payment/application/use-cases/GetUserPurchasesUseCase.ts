import { IPaymentReadRepository } from '../../domain/IRepositories/IPaymentReadRepository';
import { IPayment } from '../../domain/entities/Payment';
import { IGetUserPurchases } from '../interfaces/IGetUserPurchases';

export class GetUserPurchasesUseCase implements IGetUserPurchases {
  constructor(private paymentRepository: IPaymentReadRepository) {}

  async execute(
    userId: string,
    page: number,
    limit: number,
    filters?: { status?: string; startDate?: Date; endDate?: Date },
  ): Promise<{ data: IPayment[]; totalCount: number }> {
    return await this.paymentRepository.findPaymentsByUser(
      userId,
      page,
      limit,
      filters,
    );
  }
}
