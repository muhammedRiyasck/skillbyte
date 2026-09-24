import { Request, Response } from 'express';
import { IHandleStripeWebhook } from '../../application/interfaces/IHandleStripeWebhook';
import { ICapturePayPalPayment } from '../../application/interfaces/ICapturePayPalPayment';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';

/**
 * Controller responsible solely for payment provider webhook/capture ingress.
 * Handles Stripe webhook verification and PayPal payment capture.
 * SRP: Only reason to change is if the webhook/capture contract changes.
 */
export class PaymentWebhookController {
  constructor(
    private _handleStripeWebhookUc: IHandleStripeWebhook,
    private _capturePayPalPaymentUc: ICapturePayPalPayment,
  ) {}

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
