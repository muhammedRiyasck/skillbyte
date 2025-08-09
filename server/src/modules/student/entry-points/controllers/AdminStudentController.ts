import { Request,Response } from "express";
import { ListAllStudentsUseCase } from "../../application/use-cases/ListAllStudents";
import { ChangeStudentStatusUseCase } from "../../application/use-cases/ChangeAccountStatus";

export class AdminStudentController {
  constructor(private listAllUC: ListAllStudentsUseCase,
    private changeStatusUC: ChangeStudentStatusUseCase) {}

    listAll =async (req: Request, res: Response)=>  {
    const students = await this.listAllUC.execute();
    res.json(students);
  };

  changeStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["active", "suspended"].includes(status))
    return res.status(400).json({ message: "Invalid status" });

  await this.changeStatusUC.execute(id, status);
  res.json({ message: `Student account status changed to ${status}` });
};
}
