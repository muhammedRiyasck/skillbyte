import { Request,Response } from "express";
import { IListAllStudentsUseCase } from "../../application/interfaces/IListAllStudentsUseCase";
import { IChangeStudentStatusUseCase } from "../../application/interfaces/IChangeStudentStatusUseCase";
import { IGetPaginatedStudentsUseCase } from "../../application/interfaces/IGetPaginatedStudentsUseCase";
import { HttpStatusCode } from "../../../../shared/enums/HttpStatusCodes";
import { ApiResponseHelper } from "../../../../shared/utils/ApiResponseHelper";
import { HttpError } from "../../../../shared/types/HttpError";

export class AdminStudentController {
  constructor(
    private _getPaginatedStudentsUC: IGetPaginatedStudentsUseCase,
    private _changeStatusUC: IChangeStudentStatusUseCase
    ) {}

  /**
   * Lists all students with pagination
   * @param req The Express request object with optional page, limit, and sort query parameters
   * @param res The Express response object
   * @returns Promise<void>
   */
  listAll = async (req: Request, res: Response)=>  {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (typeof req.query.sort === 'string') {
      const [field, dir] = (req.query.sort as string).split(':');
      sort = { [field]: dir === 'asc' ? 1 : -1 };
    }

    const students = await this._getPaginatedStudentsUC.execute({}, page, limit, sort);
    ApiResponseHelper.success(res, "Students retrieved successfully", { students });
  };
  /**
   * Changes the status of a student account (active/blocked)
   * @param req The Express request object containing status and studentId in body
   * @param res The Express response object
   * @returns Promise<void>
   */
  changeStatus = async (req: Request, res: Response) => {
  // const { id } = req.params;

  const { status,studentId } = req.body;
  if (!["active", "blocked"].includes(status))
    throw new HttpError("Invalid status", HttpStatusCode.BAD_REQUEST);
  await this._changeStatusUC.execute(studentId, status);
  ApiResponseHelper.success(res, `Student account status changed to ${status}`);
};
}
