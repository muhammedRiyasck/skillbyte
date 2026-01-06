import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IPayment } from '../../domain/entities/Payment';
import { IPaymentWriteRepository } from '../../domain/IRepositories/IPaymentWriteRepository';
import { PaymentModel } from '../models/PaymentModel';
import { IPaymentDocument } from '../types/IPaymentDocument';

export class PaymentWriteRepository
  extends BaseRepository<IPayment, IPaymentDocument>
  implements IPaymentWriteRepository
{
  constructor() {
    super(PaymentModel);
  }

  toEntity(doc: IPaymentDocument): IPayment {
    return {
      paymentId: doc._id.toString(),
      userId: doc.userId.toString(),
      studentName: doc.studentName,
      studentEmail: doc.studentEmail,
      courseId: doc.courseId.toString(),
      amount: doc.amount,
      currency: doc.currency,
      stripePaymentIntentId: doc.stripePaymentIntentId,
      paypalOrderId: doc.paypalOrderId,
      status: doc.status,
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

  async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
    const created = await this.model.create(paymentData);
    return this.toEntity(created);
  }

  async updatePaymentStatus(
    paymentIntentId: string,
    status: string,
  ): Promise<IPayment | null> {
    const doc = await this.model.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { status },
      { new: true },
    );
    return doc ? this.toEntity(doc) : null;
  }

  async updatePaymentStatusByPayPalOrder(
    orderId: string,
    status: string,
  ): Promise<IPayment | null> {
    const doc = await this.model.findOneAndUpdate(
      { paypalOrderId: orderId },
      { status },
      { new: true },
    );
    return doc ? this.toEntity(doc) : null;
  }
}
