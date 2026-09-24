import { Request, Response } from 'express';
import { IHandleStripeWebhook } from '../../application/interfaces/IHandleStripeWebhook';
import { ICapturePayPalPayment } from '../../application/interfaces/ICapturePayPalPayment';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';

/** Handles HTTP requests for payment webhook operations. */
export class PaymentWebhookController {
  constructor(
    private _handleStripeWebhookUc: IHandleStripeWebhook,
    private _capturePayPalPaymentUc: ICapturePayPalPayment,
  ) {}

  /**
   * Handle stripe webhook for the PaymentWebhook entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    if (!sig) {
      ApiResponseHelper.badRequest(res, 'Webhook Error: Missing signature');
      return;
    }

    await this._handleStripeWebhookUc.execute(sig as string, payload);
    ApiResponseHelper.success(res, 'Webhook received', { received: true });
  };

  /**
   * Capture pay pal payment for the PaymentWebhook entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  capturePayPalPayment = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.body;

    if (!orderId) {
      ApiResponseHelper.badRequest(res, 'Order ID is required');
      return;
    }

    const result = await this._capturePayPalPaymentUc.execute(orderId);

    if (result.success && result.payment) {
      ApiResponseHelper.success(res, 'Payment captured successfully', {
        ...result,
        payment: result.payment,
      });
    } else if (result.success) {
      ApiResponseHelper.success(res, 'Payment captured successfully', result);
    } else {
      ApiResponseHelper.badRequest(res, 'Payment capture failed');
    }
  };
}
