import { IRefundPaymentUseCase } from '../interfaces/IRefundPaymentUseCase';
import { IPaymentReadRepository } from '../../domain/IRepositories/IPaymentReadRepository';
import { IPaymentWriteRepository } from '../../domain/IRepositories/IPaymentWriteRepository';
import { PaymentStatus } from '../../../../shared/enums/PaymentStatus';
import { IPaymentProvider } from '../../../../shared/services/payment/interfaces/IPaymentProvider';
import { IPayPalProvider } from '../../../../shared/services/payment/interfaces/IPayPalProvider';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import logger from '../../../../shared/utils/Logger';

/** Executes the business logic for refund payment. */
export class RefundPaymentUseCase implements IRefundPaymentUseCase {
  constructor(
    private paymentReadRepo: IPaymentReadRepository,
    private paymentWriteRepo: IPaymentWriteRepository,
    private stripeProvider: IPaymentProvider,
    private paypalProvider: IPayPalProvider & IPaymentProvider,
  ) {}

  /**
   * Execute for the RefundPayment entity.
   *
   * @param paymentId - The unique identifier for the payment.
   * @returns The result of the operation.
   */
  async execute(paymentId: string): Promise<boolean> {
    const payment = await this.paymentReadRepo.findById(paymentId);
    if (!payment) {
      throw new HttpError('Payment not found', HttpStatusCode.NOT_FOUND);
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      logger.info(`Payment ${paymentId} is already marked as refunded.`);
      return true;
    }

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new HttpError(
        `Cannot refund payment with status ${payment.status}`,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    let refundSuccess = false;

    if (payment.stripePaymentIntentId) {
      logger.info(`Initiating Stripe refund for payment ${payment.paymentId}`);
      refundSuccess = await this.stripeProvider.refund(
        payment.stripePaymentIntentId,
      );
    } else if (payment.paypalCaptureId) {
      logger.info(`Initiating PayPal refund for payment ${payment.paymentId}`);
      refundSuccess = await this.paypalProvider.refund(payment.paypalCaptureId);
    } else {
      logger.warn(
        `No provider transaction ID on payment ${payment.paymentId}. Proceeding with internal refund.`,
      );
      refundSuccess = true;
    }

    if (refundSuccess) {
      await this.paymentWriteRepo.updateStatus(
        payment.paymentId!,
        PaymentStatus.REFUNDED,
      );
      logger.info(`Refund successful for payment ${payment.paymentId}`);
      return true;
    } else {
      logger.error(`Refund failed for payment ${payment.paymentId}`);
      throw new HttpError('Refund failed', HttpStatusCode.BAD_REQUEST);
    }
  }
}
