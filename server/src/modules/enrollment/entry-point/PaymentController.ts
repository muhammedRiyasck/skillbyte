import { Request, Response } from 'express';
import { IInitiateEnrollmentPayment } from '../application/interfaces/IInitiateEnrollmentPayment';
import { IHandleStripeWebhook } from '../application/interfaces/IHandleStripeWebhook';
import { ICapturePayPalPayment } from '../application/interfaces/ICapturePayPalPayment';
import { IGetUserPurchases } from '../application/interfaces/IGetUserPurchases';
import { IGetInstructorEarnings } from '../application/interfaces/IGetInstructorEarnings';
import { ApiResponseHelper } from '../../../shared/utils/ApiResponseHelper';
import { AuthenticatedRequest } from '../../../shared/types/AuthenticatedRequestType';
import logger from '../../../shared/utils/Logger';

export class PaymentController {
  constructor(
    private _initiatePaymentUc: IInitiateEnrollmentPayment,
    private _handleStripeWebhookUc: IHandleStripeWebhook,
    private _capturePayPalPaymentUc: ICapturePayPalPayment,
    private _getUserPurchasesUc: IGetUserPurchases,
    private _getInstructorEarningsUc: IGetInstructorEarnings,
  ) {}

  async initiatePayment(req: Request, res: Response) {
    try {
      const { courseId, provider } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        return ApiResponseHelper.unauthorized(res, 'Unauthorized');
      }

      const result = await this._initiatePaymentUc.execute(
        userId,
        courseId,
        provider,
      );
      return ApiResponseHelper.success(res, 'Payment initiated', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.badRequest(res, message);
    }
  }

  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    // Need raw body here.
    const payload = req.body;

    if (!sig) {
      return res.status(400).send('Webhook Error: Missing signature');
    }

    try {
      // logger.info(`Checkout session created`);
      await this._handleStripeWebhookUc.execute(sig as string, payload);
      return res.status(200).send({ received: true });
    } catch (error) {
      logger.error('Webhook Error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(400).send(`Webhook Error: ${message}`);
    }
  }

  async capturePayPalPayment(req: Request, res: Response) {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return ApiResponseHelper.badRequest(res, 'Order ID is required');
      }

      const result = await this._capturePayPalPaymentUc.execute(orderId);

      if (result.success) {
        return ApiResponseHelper.success(
          res,
          'Payment captured and enrollment created',
          result,
        );
      } else {
        return ApiResponseHelper.badRequest(res, 'Payment capture failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.error(res, message);
    }
  }

  async getUserPurchases(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      if (!userId) {
        return ApiResponseHelper.unauthorized(res, 'Unauthorized');
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await this._getUserPurchasesUc.execute(
        userId,
        page,
        limit,
      );
      return ApiResponseHelper.success(res, 'Purchases fetched', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.badRequest(res, message);
    }
  }

  async getInstructorEarnings(req: Request, res: Response) {
    try {
      const instructorId = (req as AuthenticatedRequest).user.id;
      if (!instructorId) {
        return ApiResponseHelper.unauthorized(res, 'Unauthorized');
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await this._getInstructorEarningsUc.execute(
        instructorId,
        page,
        limit,
      );
      return ApiResponseHelper.success(res, 'Earnings fetched', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.badRequest(res, message);
    }
  }
}
