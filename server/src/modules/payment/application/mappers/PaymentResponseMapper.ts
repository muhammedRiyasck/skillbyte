import { IPayment } from '../../domain/entities/Payment';
import { PaymentResponseDto } from '../dtos/PaymentResponseDto';

/** Handles payment response mapper functionality. */
export class PaymentResponseMapper {
  /**
   * To response dto for the PaymentResponseMapper entity.
   *
   * @param payment - The payment information.
   * @returns The standardized HTTP response.
   */
  static toResponseDto(payment: IPayment): PaymentResponseDto {
    return {
      id: payment.paymentId!,
      courseId: payment.courseId,
      mentorshipBookingId: payment.mentorshipBookingId,
      amount: payment.amount,
      instructorAmount: payment.instructorAmount,
      adminFee: payment.adminFee,
      currency: payment.currency,
      status: payment.status,
      productName: payment.productName,
      productImage: payment.productImage,
      studentName: payment.studentName,
      studentEmail: payment.studentEmail,
      createdAt: payment.createdAt,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      paypalOrderId: payment.paypalOrderId,
    };
  }
}
