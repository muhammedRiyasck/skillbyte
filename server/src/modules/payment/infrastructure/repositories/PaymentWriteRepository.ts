import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IPayment } from '../../domain/entities/Payment';
import { IPaymentWriteRepository } from '../../domain/IRepositories/IPaymentWriteRepository';
import { PaymentModel } from '../models/PaymentModel';
import { IPaymentDocument } from '../types/IPaymentDocument';
import { PaymentMapper } from '../mappers/PaymentMapper';

export class PaymentWriteRepository
  extends BaseRepository<IPayment, IPaymentDocument>
  implements IPaymentWriteRepository
{
  constructor() {
    super(PaymentModel);
  }

  toEntity(doc: IPaymentDocument): IPayment {
    return PaymentMapper.toEntity(doc);
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

  async updatePayPalCaptureId(
    orderId: string,
    captureId: string,
  ): Promise<void> {
    await this.model.updateOne(
      { paypalOrderId: orderId },
      { paypalCaptureId: captureId },
    );
  }

  async updateStatus(paymentId: string, status: string): Promise<void> {
    await this.model.findByIdAndUpdate(paymentId, { status });
  }

  async updatePaymentDetails(
    paymentId: string,
    paymentData: Partial<IPayment>,
  ): Promise<IPayment | null> {
    const doc = await this.model.findByIdAndUpdate(
      paymentId,
      { $set: paymentData },
      { new: true },
    );
    return doc ? this.toEntity(doc) : null;
  }
}
