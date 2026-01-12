import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../shared/utils/ApiResponseHelper';
import { IGetUserPurchases } from '../application/interfaces/IGetUserPurchases';
import { IGetInstructorEarnings } from '../application/interfaces/IGetInstructorEarnings';
import { IHandleStripeWebhook } from '../application/interfaces/IHandleStripeWebhook';
import { ICapturePayPalPayment } from '../application/interfaces/ICapturePayPalPayment';
import { PaymentMapper } from '../application/mappers/PaymentMapper';
import logger from '../../../shared/utils/Logger';

export class PaymentController {
  constructor(
    private _getUserPurchasesUc: IGetUserPurchases,
    private _getInstructorEarningsUc: IGetInstructorEarnings,
    private _handleStripeWebhookUc: IHandleStripeWebhook,
    private _capturePayPalPaymentUc: ICapturePayPalPayment,
  ) {}

  async handleStripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    if (!sig) {
      return ApiResponseHelper.badRequest(
        res,
        'Webhook Error: Missing signature',
      );
    }

    try {
      await this._handleStripeWebhookUc.execute(sig as string, payload);
      return ApiResponseHelper.success(res, 'Webhook received', {
        received: true,
      });
    } catch (error) {
      logger.error('Webhook Error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.badRequest(res, `Webhook Error: ${message}`);
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
          'Payment captured successfully',
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
      const status = req.query.status as string;
      const dateRange = req.query.dateRange as string;

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (dateRange) {
        const now = new Date();
        if (dateRange === '30_days') {
          startDate = new Date(now.setDate(now.getDate() - 30));
        } else if (dateRange === '3_months') {
          startDate = new Date(now.setMonth(now.getMonth() - 3));
        } else if (dateRange === 'last_year') {
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        }
      }

      const result = await this._getUserPurchasesUc.execute(
        userId,
        page,
        limit,
        { status, startDate, endDate },
      );

      return ApiResponseHelper.success(
        res,
        'Purchases fetched',
        PaymentMapper.toPurchaseHistoryResponse(result),
      );
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

      return ApiResponseHelper.success(
        res,
        'Earnings fetched',
        PaymentMapper.toEarningsResponse(result),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponseHelper.badRequest(res, message);
    }
  }
}
