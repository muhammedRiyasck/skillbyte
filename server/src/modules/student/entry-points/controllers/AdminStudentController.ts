import { Request, Response } from 'express';
import { IGetPaginatedStudentsUseCase } from '../../application/interfaces/IGetPaginatedStudentsUseCase';
import { IChangeStudentStatusUseCase } from '../../application/interfaces/IChangeStudentStatusUseCase';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import {
  AdminStudentPaginationRequestDto,
  ChangeStudentStatusRequestDto,
} from '../../application/dtos/AdminStudentRequestDto';

/**
 * Controller for admin student management operations.
 */
export class AdminStudentController {
  constructor(
    private _listStudentsUseCase: IGetPaginatedStudentsUseCase,
    private _changeStudentStatusUseCase: IChangeStudentStatusUseCase,
  ) {}

  /**
   * Retrieves a paginated list of all students based on query filters.
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
   * Changes the account status (ACTIVE/BLOCKED) of a specific student.
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
