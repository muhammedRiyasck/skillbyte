import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { IGetInstructorEarnings } from '../../application/interfaces/IGetInstructorEarnings';

/** Handles HTTP requests for instructor earnings operations. */
export class InstructorEarningsController {
  constructor(private _getInstructorEarningsUc: IGetInstructorEarnings) {}

  /**
   * Get instructor earnings for the InstructorEarnings entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  getInstructorEarnings = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const instructorId = (req as AuthenticatedRequest).user.id;
    if (!instructorId) {
      ApiResponseHelper.unauthorized(res, 'Unauthorized');
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const trendDays = Math.min(
      Math.max(Number(req.query.trendDays) || 0, 0),
      90,
    );
    const search = (req.query.search as string) || undefined;
    const filter = (req.query.filter as string) || undefined;

    const result = await this._getInstructorEarningsUc.execute({
      instructorId,
      page,
      limit,
      trendDays,
      search,
      filter,
    });

    ApiResponseHelper.success(res, 'Earnings fetched', result);
  };
}
