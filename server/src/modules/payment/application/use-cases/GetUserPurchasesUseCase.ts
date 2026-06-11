import { IPaymentReadRepository } from '../../domain/IRepositories/IPaymentReadRepository';
import { PaymentResponseMapper } from '../mappers/PaymentResponseMapper';
import { GetUserPurchasesDto } from '../dtos/PaymentDto';
import { PaymentResponseDto } from '../dtos/PaymentResponseDto';
import { IGetUserPurchases } from '../interfaces/IGetUserPurchases';

export class GetUserPurchasesUseCase implements IGetUserPurchases {
  constructor(private paymentRepository: IPaymentReadRepository) {}

  async execute(
    dto: GetUserPurchasesDto,
  ): Promise<{ data: PaymentResponseDto[]; totalCount: number }> {
    const { userId, page = 1, limit = 10, status, dateRange } = dto;
    const filters: { status?: string; startDate?: Date; endDate?: Date } = {};
    if (status) filters.status = status;
    if (dateRange) {
      // Very basic date parsing for demonstration.
      // E.g. dateRange = 'last30days'
      if (dateRange === 'last30days') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        filters.startDate = d;
      }
    }

    const { data, totalCount } =
      await this.paymentRepository.findPaymentsByUser(
        userId,
        page,
        limit,
        filters,
      );

    return {
      data: data.map(PaymentResponseMapper.toResponseDto),
      totalCount,
    };
  }
}
