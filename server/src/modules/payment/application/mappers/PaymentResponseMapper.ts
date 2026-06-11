import { IPayment } from '../../domain/entities/Payment';
import { PaymentResponseDto } from '../dtos/PaymentResponseDto';

export class PaymentResponseMapper {
  static toResponseDto(payment: IPayment): PaymentResponseDto {
    return {
      paymentId: payment.paymentId!,
      courseId: payment.courseId,
      mentorshipBookingId: payment.mentorshipBookingId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      productName: payment.productName,
      productImage: payment.productImage,
      createdAt: payment.createdAt,
    };
  }
}
