import { PaymentMapper } from '../mappers/PaymentMapper';

type PaymentResponseDto = ReturnType<typeof PaymentMapper.toResponse>;

export interface ICapturePayPalPayment {
  execute(
    orderId: string,
  ): Promise<{ success: boolean; payment?: PaymentResponseDto }>;
}
