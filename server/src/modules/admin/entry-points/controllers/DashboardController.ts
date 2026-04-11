import { Request, Response } from 'express';
import { GetDashboardDataUseCase } from '../../application/use-cases/GetDashboardDataUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';

export class AdminDashboardController {
  constructor(private _getDashboardDataUseCase: GetDashboardDataUseCase) {}

  getDashboardData = async (req: Request, res: Response): Promise<void> => {
    const data = await this._getDashboardDataUseCase.execute();
    ApiResponseHelper.success(
      res,
      'Dashboard data fetched successfully',
      data,
      HttpStatusCode.OK,
    );
  };
}
