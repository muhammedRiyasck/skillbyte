import { Request, Response } from 'express';
import { IGetPaginatedStudentsUseCase } from '../../application/interfaces/IGetPaginatedStudentsUseCase';
import { IChangeStudentStatusUseCase } from '../../application/interfaces/IChangeStudentStatusUseCase';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import {
  AdminStudentPaginationRequestDto,
  ChangeStudentStatusRequestDto,
} from '../../application/dtos/AdminStudentRequestDto';

/** Handles HTTP requests for admin student operations. */
export class AdminStudentController {
  constructor(
    private _listStudentsUseCase: IGetPaginatedStudentsUseCase,
    private _changeStudentStatusUseCase: IChangeStudentStatusUseCase,
  ) {}

  /**
   * Get all students for the AdminStudent entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  getAllStudents = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as AdminStudentPaginationRequestDto;

    const students = await this._listStudentsUseCase.execute(
      query,
      query.page ?? 1,
      query.limit ?? 6,
    );

    ApiResponseHelper.success(res, 'Students fetched successfully', students);
  };

  /**
   * Change student status for the AdminStudent entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  changeStudentStatus = async (req: Request, res: Response): Promise<void> => {
    const dto: ChangeStudentStatusRequestDto = req.body;

    await this._changeStudentStatusUseCase.execute(dto.id, dto.status);

    ApiResponseHelper.success(
      res,
      `Student status updated to ${dto.status} successfully`,
    );
  };
}
