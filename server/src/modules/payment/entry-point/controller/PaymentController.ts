import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { IGetUserPurchases } from '../../application/interfaces/IGetUserPurchases';
import { DateRange } from '../../../../shared/enums/DateRange';
import { PaymentStatus } from '../../../../shared/enums/PaymentStatus';

/**
 * Controller for student payment history (purchase listing).
 * SRP: Only reason to change is if the student purchase history API contract changes.
 *
 * @see PaymentWebhookController – for Stripe webhook and PayPal capture
 * @see InstructorEarningsController – for instructor earnings analytics
 */
export class PaymentController {
  constructor(private _getUserPurchasesUc: IGetUserPurchases) {}

  getUserPurchases = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user.id;
    if (!userId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as PaymentStatus;
    const dateRange = req.query.dateRange as DateRange;

    const result = await this._getUserPurchasesUc.execute({
      userId,
      page,
      limit,
      status,
      dateRange,
    });

    ApiResponseHelper.success(res, 'Purchases fetched', result);
  };
}
