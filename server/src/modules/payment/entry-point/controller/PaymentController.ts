import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { IGetUserPurchases } from '../../application/interfaces/IGetUserPurchases';
import { IGetInstructorEarnings } from '../../application/interfaces/IGetInstructorEarnings';
import { IHandleStripeWebhook } from '../../application/interfaces/IHandleStripeWebhook';
import { ICapturePayPalPayment } from '../../application/interfaces/ICapturePayPalPayment';
import { PaymentMapper } from '../../application/mappers/PaymentMapper';
import { DateRange } from '../../../../shared/enums/DateRange';
import { PaymentStatus } from '../../../../shared/enums/PaymentStatus';

export class PaymentController {
  constructor(
    private _getUserPurchasesUc: IGetUserPurchases,
    private _getInstructorEarningsUc: IGetInstructorEarnings,
    private _handleStripeWebhookUc: IHandleStripeWebhook,
    private _capturePayPalPaymentUc: ICapturePayPalPayment,
  ) {}

  // change methods to arrow functions

  handleStripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    if (!sig) {
      ApiResponseHelper.badRequest(res, 'Webhook Error: Missing signature');
      return;
    }

    await this._handleStripeWebhookUc.execute(sig as string, payload);
    ApiResponseHelper.success(res, 'Webhook received', {
      received: true,
    });
  };

  capturePayPalPayment = async (req: Request, res: Response) => {
    const { orderId } = req.body;

    if (!orderId) {
      ApiResponseHelper.badRequest(res, 'Order ID is required');
      return;
    }

    const result = await this._capturePayPalPaymentUc.execute(orderId);

    if (result.success && result.payment) {
      ApiResponseHelper.success(res, 'Payment captured successfully', {
        ...result,
        payment: PaymentMapper.toResponse(result.payment),
      });
    } else if (result.success) {
      ApiResponseHelper.success(res, 'Payment captured successfully', result);
    } else {
      ApiResponseHelper.badRequest(res, 'Payment capture failed');
    }
  };

  getUserPurchases = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.id;
    if (!userId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as PaymentStatus;
    const dateRange = req.query.dateRange as DateRange;

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (dateRange) {
      const now = new Date();
      if (dateRange === DateRange.THIRTY_DAYS) {
        startDate = new Date(now.setDate(now.getDate() - 30));
      } else if (dateRange === DateRange.THREE_MONTHS) {
        startDate = new Date(now.setMonth(now.getMonth() - 3));
      } else if (dateRange === DateRange.LAST_YEAR) {
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      }
    }

    const result = await this._getUserPurchasesUc.execute(userId, page, limit, {
      status,
      startDate,
      endDate,
    });

    ApiResponseHelper.success(
      res,
      'Purchases fetched',
      PaymentMapper.toPurchaseHistoryResponse(result),
    );
  };

  getInstructorEarnings = async (req: Request, res: Response) => {
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
  };
}
