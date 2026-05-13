import { IPayment as IPaymentEntity } from '../../domain/entities/Payment';

export class PaymentMapper {
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

  static toResponseList(payments: IPaymentEntity[]) {
    return payments.map((payment) => this.toResponse(payment));
  }

  static toPurchaseHistoryResponse(data: {
    data: IPaymentEntity[];
    totalCount: number;
  }) {
    return {
      purchases: this.toResponseList(data.data),
      totalCount: data.totalCount,
    };
  }

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
