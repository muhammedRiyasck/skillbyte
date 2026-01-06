import { IPayment } from '../../domain/entities/Payment';

export class PaymentMapper {
  static toResponse(payment: IPayment) {
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

  static toResponseList(payments: IPayment[]) {
    return payments.map((payment) => this.toResponse(payment));
  }

  static toPurchaseHistoryResponse(data: {
    data: IPayment[];
    totalCount: number;
  }) {
    return {
      purchases: this.toResponseList(data.data),
      totalCount: data.totalCount,
    };
  }

  static toEarningsResponse(data: {
    data: IPayment[];
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
