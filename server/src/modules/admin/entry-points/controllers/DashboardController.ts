import { Request, Response } from 'express';
import { IGetDashboardDataUseCase } from '../../application/interfaces/IGetDashboardDataUseCase';
import { GetRevenueTrendByYearUseCase } from '../../application/use-cases/GetRevenueTrendByYearUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';

export class AdminDashboardController {
  constructor(
    private _getDashboardDataUseCase: IGetDashboardDataUseCase,
    private _getRevenueTrendByYearUseCase: GetRevenueTrendByYearUseCase,
  ) {}

  getDashboardData = async (req: Request, res: Response): Promise<void> => {
    const data = await this._getDashboardDataUseCase.execute();
    ApiResponseHelper.success(
      res,
      'Dashboard data fetched successfully',
      data,
      HttpStatusCode.OK,
    );
  };

  getRevenueTrendByYear = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const data = await this._getRevenueTrendByYearUseCase.execute(year);
    ApiResponseHelper.success(
      res,
      'Revenue trend fetched successfully',
      data,
      HttpStatusCode.OK,
    );
  };
}
