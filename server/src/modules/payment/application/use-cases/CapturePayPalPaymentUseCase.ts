import { IPaymentWriteRepository } from '../../domain/IRepositories/IPaymentWriteRepository';
import { IPayPalProvider } from '../../../../shared/services/payment/interfaces/IPayPalProvider';
import logger from '../../../../shared/utils/Logger';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import {
  PAYMENT_EVENTS,
  PaymentSucceededEvent,
} from '../../../../shared/services/event-bus/PaymentEvents';
import { ICapturePayPalPayment } from '../interfaces/ICapturePayPalPayment';

export class CapturePayPalPaymentUseCase implements ICapturePayPalPayment {
  constructor(
    private _paymentRepository: IPaymentWriteRepository,
    private _paypalProvider: IPayPalProvider,
  ) {}

  async execute(orderId: string): Promise<{ success: boolean }> {
    try {
      // 1. Capture the PayPal payment
      const captureData = await this._paypalProvider.capturePayment(orderId);

      // 2. Validate capture status
      const status = captureData.status;

      if (status !== 'COMPLETED') {
        logger.error(
          `PayPal payment capture failed. Status: ${status}`,
          captureData,
        );
        await this._paymentRepository.updatePaymentStatusByPayPalOrder(
          orderId,
          'failed',
        );
        return { success: false };
      }

      // 3. Update Payment record to succeeded
      const payment =
        await this._paymentRepository.updatePaymentStatusByPayPalOrder(
          orderId,
          'succeeded',
        );

      if (!payment) {
        logger.error(
          `Payment record not found for PayPal Order ID: ${orderId}`,
        );
        return { success: false };
      }

      // 4. Emit event for other modules to handle
      const paymentEvent: PaymentSucceededEvent = {
        paymentId: payment.paymentId!,
        userId: payment.userId,
        courseId: payment.courseId,
        amount: payment.amount,
        currency: payment.currency,
        metadata: payment.metadata,
      };

      logger.info(
        `Emitting payment.succeeded event for payment ${payment.paymentId}`,
      );
      eventBus.emit(PAYMENT_EVENTS.PAYMENT_SUCCEEDED, paymentEvent);

      return { success: true };
    } catch (error) {
      logger.error('Error in CapturePayPalPaymentUseCase:', error);
      await this._paymentRepository.updatePaymentStatusByPayPalOrder(
        orderId,
        'failed',
      );

      throw error;
    }
  }
}
