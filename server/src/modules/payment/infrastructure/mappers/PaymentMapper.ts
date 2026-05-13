import { IPayment as IPaymentEntity } from '../../domain/entities/Payment';
import { IPaymentDocument } from '../types/IPaymentDocument';
import { PaymentStatus } from '../../../../shared/enums/PaymentStatus';

export class PaymentMapper {
  static toEntity(doc: IPaymentDocument): IPaymentEntity {
    return {
      paymentId: doc._id.toString(),
      userId: doc.userId.toString(),
      studentName: doc.studentName,
      studentEmail: doc.studentEmail,
      courseId: doc.courseId ? doc.courseId.toString() : undefined,
      mentorshipBookingId: doc.mentorshipBookingId
        ? doc.mentorshipBookingId.toString()
        : undefined,
      amount: doc.amount,
      currency: doc.currency,
      stripePaymentIntentId: doc.stripePaymentIntentId,
      paypalOrderId: doc.paypalOrderId,
      paypalCaptureId: doc.paypalCaptureId,
      status: doc.status as PaymentStatus,
      metadata: doc.metadata,
      instructorId: doc.instructorId.toString(),
      adminFee: doc.adminFee,
      instructorAmount: doc.instructorAmount,
      productName: doc.productName,
      productImage: doc.productImage,
      convertedAmount: doc.convertedAmount,
      convertedCurrency: doc.convertedCurrency,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
