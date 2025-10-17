import { Request,Response } from "express";
import { IListAllStudentsUseCase } from "../../application/interfaces/IListAllStudentsUseCase";
import { IChangeStudentStatusUseCase } from "../../application/interfaces/IChangeStudentStatusUseCase";
import { HttpStatusCode } from "../../../../shared/enums/HttpStatusCodes";
import { ApiResponseHelper } from "../../../../shared/utils/ApiResponseHelper";
import { HttpError } from "../../../../shared/types/HttpError";

export class AdminStudentController {
  constructor(private listAllUC: IListAllStudentsUseCase,
    private changeStatusUC: IChangeStudentStatusUseCase) {}

  /**
   * Lists all students
   * @param req The Express request object
   * @param res The Express response object
   * @returns Promise<void>
   */
  listAll = async (req: Request, res: Response)=>  {
    const students = await this.listAllUC.execute();
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
console.log(studentId,status,'studentIdstudentId')
  await this.changeStatusUC.execute(studentId, status);
  ApiResponseHelper.success(res, `Student account status changed to ${status}`);
};
}
