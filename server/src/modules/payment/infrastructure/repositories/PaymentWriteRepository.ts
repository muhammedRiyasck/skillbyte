import { BaseRepository } from '../../../../shared/repositories/BaseRepository';
import { IPayment } from '../../domain/entities/Payment';
import { IPaymentWriteRepository } from '../../domain/IRepositories/IPaymentWriteRepository';
import { PaymentModel } from '../models/PaymentModel';
import { IPaymentDocument } from '../types/IPaymentDocument';
import { PaymentMapper } from '../mappers/PaymentMapper';

/** Manages database operations for payment write. */
export class PaymentWriteRepository
  extends BaseRepository<IPayment, IPaymentDocument>
  implements IPaymentWriteRepository
{
  constructor() {
    super(PaymentModel);
  }

  /**
   * To entity for the PaymentWrite entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  toEntity(doc: IPaymentDocument): IPayment {
    return PaymentMapper.toEntity(doc);
  }

  /**
   * Create payment for the PaymentWrite entity.
   *
   * @param paymentData - The payment data information.
   * @returns The result of the operation.
   */
  async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
    const created = await this.model.create(paymentData);
    return this.toEntity(created);
  }

  /**
   * Update payment status for the PaymentWrite entity.
   *
   * @param paymentIntentId - The unique identifier for the paymentIntent.
   * @param status - The status information.
   * @returns The result of the operation.
   */
  async updatePaymentStatus(
    paymentIntentId: string,
    status: string,
  ): Promise<IPayment | null> {
    const doc = await this.model.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId, status: { $ne: status } },
      { status },
      { new: true },
    );
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Update payment status by pay pal order for the PaymentWrite entity.
   *
   * @param orderId - The unique identifier for the order.
   * @param status - The status information.
   * @returns The result of the operation.
   */
  async updatePaymentStatusByPayPalOrder(
    orderId: string,
    status: string,
  ): Promise<IPayment | null> {
    const doc = await this.model.findOneAndUpdate(
      { paypalOrderId: orderId, status: { $ne: status } },
      { status },
      { new: true },
    );
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Update pay pal capture id for the PaymentWrite entity.
   *
   * @param orderId - The unique identifier for the order.
   * @param captureId - The unique identifier for the capture.
   */
  async updatePayPalCaptureId(
    orderId: string,
    captureId: string,
  ): Promise<void> {
    await this.model.updateOne(
      { paypalOrderId: orderId },
      { paypalCaptureId: captureId },
    );
  }

  /**
   * Update status for the PaymentWrite entity.
   *
   * @param paymentId - The unique identifier for the payment.
   * @param status - The status information.
   */
  async updateStatus(paymentId: string, status: string): Promise<void> {
    await this.model.findByIdAndUpdate(paymentId, { status });
  }

  /**
   * Update payment details for the PaymentWrite entity.
   *
   * @param paymentId - The unique identifier for the payment.
   * @param paymentData - The payment data information.
   * @returns The result of the operation.
   */
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
