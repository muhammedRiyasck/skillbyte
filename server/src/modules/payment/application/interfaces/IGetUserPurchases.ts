import { GetUserPurchasesDto } from '../dtos/PaymentDto';
import { PaymentResponseDto } from '../dtos/PaymentResponseDto';

export interface IGetUserPurchases {
  execute(
    dto: GetUserPurchasesDto,
  ): Promise<{ data: PaymentResponseDto[]; totalCount: number }>;
}
