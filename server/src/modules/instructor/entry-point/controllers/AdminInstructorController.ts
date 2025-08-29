import { Request,Response } from "express";
import { ListPendingInstructorsUseCase } from "../../application/use-cases/ListPendingInstructors";
import { ApproveInstructorUseCase } from "../../application/use-cases/ApproveInstructor";
import { DeclineInstructorUseCase } from "../../application/use-cases/DeclineInstructor";
import { ListApprovedInstructorsUseCase } from "../../application/use-cases/ListApprovedInstructors";
import { ChangeInstructorStatusUseCase } from "../../application/use-cases/ChangeAccountStatus";


export class AdminInstructorController {
  constructor(
    private listPendingUC: ListPendingInstructorsUseCase,
    private approveUC: ApproveInstructorUseCase,
    private declineUC: DeclineInstructorUseCase,
    private listApprovedUC: ListApprovedInstructorsUseCase,
    private changeStatusUC: ChangeInstructorStatusUseCase
  ) {}

    getPending = async (req: Request, res: Response)=> {
    const instructors = await this.listPendingUC.execute();
    res.json(instructors);
  };

    approve = async (req: any, res: Response)=>{
    
    const instructorId = req.body.id
    const adminId = req.user.id
    
    await this.approveUC.execute(instructorId, adminId);
    res.json({ message: "Instructor approved" });
  };

    decline = async  (req: any, res: Response)=> {
    const instructorId = req.body.id
    const adminId = req.user.id
    const { reason } = req.body;
    await this.declineUC.execute(instructorId,adminId, reason);
    res.json({ message: "Instructor declined", note: reason });
  };

    listApproved = async (req: Request, res: Response)=> {
    const instructors = await this.listApprovedUC.execute();
    res.json(instructors);
  };

   changeStatus = async(req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["active", "suspended"].includes(status)){
     res.status(400).json({ error: "Invalid status" })
     return;
  }
  await this.changeStatusUC.execute(id, status);
  res.json({ message: `Instructor account status changed to ${status}` });
};

}
