import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { IGetUserPurchases } from '../../application/interfaces/IGetUserPurchases';
import { DateRange } from '../../../../shared/enums/DateRange';
import { PaymentStatus } from '../../../../shared/enums/PaymentStatus';

/** Handles HTTP requests for payment operations. */
export class PaymentController {
  constructor(private _getUserPurchasesUc: IGetUserPurchases) {}

  /**
   * Get user purchases for the Payment entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
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
