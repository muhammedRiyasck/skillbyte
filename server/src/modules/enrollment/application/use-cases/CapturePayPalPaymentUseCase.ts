import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';
import { ICapturePayPalPayment } from '../interfaces/ICapturePayPalPayment';
import { IPayPalProvider } from '../../../../shared/services/payment/interfaces/IPayPalProvider';
import logger from '../../../../shared/utils/Logger';

export class CapturePayPalPaymentUseCase implements ICapturePayPalPayment {
  constructor(
    private _enrollmentRepository: IEnrollmentRepository,
    private _paypalProvider: IPayPalProvider,
  ) {}

  async execute(
    orderId: string,
  ): Promise<{ success: boolean; enrollmentId?: string }> {
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
        await this._enrollmentRepository.updatePaymentStatusByPayPalOrder(
          orderId,
          'failed',
        );
        return { success: false };
      }

      // 3. Update Payment record to succeeded
      const payment =
        await this._enrollmentRepository.updatePaymentStatusByPayPalOrder(
          orderId,
          'succeeded',
        );

      if (!payment) {
        logger.error(
          `Payment record not found for PayPal Order ID: ${orderId}`,
        );
        return { success: false };
      }

      // 4. Create Enrollment (with Idempotency check)
      const existingEnrollment =
        await this._enrollmentRepository.findEnrollment(
          payment.userId.toString(),
          payment.courseId.toString(),
        );
      if (existingEnrollment) {
        return {
          success: true,
          enrollmentId: existingEnrollment._id.toString(),
        };
      }

      const enrollment = await this._enrollmentRepository.save({
        userId: payment.userId,
        courseId: payment.courseId,
        paymentId: payment._id,
        status: 'completed',
        enrolledAt: new Date(),
        progress: 0,
      });

      return {
        success: true,
        enrollmentId: enrollment._id.toString(),
      };
    } catch (error) {
      logger.error('Error in CapturePayPalPaymentUseCase:', error);
      await this._enrollmentRepository.updatePaymentStatusByPayPalOrder(
        orderId,
        'failed',
      );
      throw error;
    }
  }
}
