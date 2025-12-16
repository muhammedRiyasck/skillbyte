import { Request, Response } from 'express';

import { IChangeStudentStatusUseCase } from '../../application/interfaces/IChangeStudentStatusUseCase';
import { IGetPaginatedStudentsUseCase } from '../../application/interfaces/IGetPaginatedStudentsUseCase';

import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';

import {
  AdminStudentPaginationSchema,
  ChangeStudentStatusSchema,
} from '../../application/dtos/AdminStudentDtos';
import { AdminStudentMapper } from '../../application/mappers/AdminStudentMapper';

export class AdminStudentController {
  constructor(
    private _getPaginatedStudentsUC: IGetPaginatedStudentsUseCase,
    private _changeStatusUC: IChangeStudentStatusUseCase,
  ) {}

  /**
   * Lists all students with pagination
   * @param req The Express request object with optional page, limit, and sort query parameters
   * @param res The Express response object
   * @returns Promise<void>
   */
  listAll = async (req: Request, res: Response) => {
    const validatedQuery = AdminStudentPaginationSchema.parse(req.query);
    const filter = AdminStudentMapper.toListAllFilter(validatedQuery);
    const sort = AdminStudentMapper.toSort(validatedQuery.sort);

    const students = await this._getPaginatedStudentsUC.execute(
      filter,
      validatedQuery.page,
      validatedQuery.limit,
      sort,
    );
    ApiResponseHelper.success(res, 'Students retrieved successfully', {
      students,
    });
  };
  /**
   * Changes the status of a student account (active/blocked)
   * @param req The Express request object containing status and studentId in body
   * @param res The Express response object
   * @returns Promise<void>
   */
  changeStatus = async (req: Request, res: Response) => {
    const validatedData = ChangeStudentStatusSchema.parse(req.body);
    await this._changeStatusUC.execute(
      validatedData.studentId,
      validatedData.status,
    );
    ApiResponseHelper.success(
      res,
      `Student account status changed to ${validatedData.status}`,
    );
  };
}
