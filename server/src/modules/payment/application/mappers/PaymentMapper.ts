import { IPayment as IPaymentEntity } from '../../domain/entities/Payment';

/** Handles payment mapper functionality. */
export class PaymentMapper {
  /**
   * To response for the PaymentMapper entity.
   *
   * @param payment - The payment information.
   */
  static toResponse(payment: IPaymentEntity) {
    return {
      id: payment.paymentId,
      userId: payment.userId,
      courseId: payment.courseId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      paypalOrderId: payment.paypalOrderId,
      productName: payment.productName,
      productImage: payment.productImage,
      studentName: payment.studentName,
      studentEmail: payment.studentEmail,
      instructorId: payment.instructorId,
      adminFee: payment.adminFee,
      instructorAmount: payment.instructorAmount,
      convertedAmount: payment.convertedAmount,
      convertedCurrency: payment.convertedCurrency,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  /**
   * To response list for the PaymentMapper entity.
   *
   * @param payments - The payments information.
   */
  static toResponseList(payments: IPaymentEntity[]) {
    return payments.map((payment) => this.toResponse(payment));
  }

  /**
   * To purchase history response for the PaymentMapper entity.
   *
   * @param data - The data information.
   */
  static toPurchaseHistoryResponse(data: {
    data: IPaymentEntity[];
    totalCount: number;
  }) {
    return {
      purchases: this.toResponseList(data.data),
      totalCount: data.totalCount,
    };
  }

  /**
   * To earnings response for the PaymentMapper entity.
   *
   * @param data - The data information.
   */
  static toEarningsResponse(data: {
    data: IPaymentEntity[];
    totalCount: number;
    totalRevenue: number;
    totalProfit: number;
  }) {
    return {
      earnings: this.toResponseList(data.data),
      totalCount: data.totalCount,
      statistics: {
        totalRevenue: data.totalRevenue,
        totalProfit: data.totalProfit,
      },
    };
  }
}
