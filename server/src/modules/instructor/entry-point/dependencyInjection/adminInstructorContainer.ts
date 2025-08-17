import { AdminInstructorController } from "../controllers/AdminInstructorController";

import { ListPendingInstructorsUseCase } from "../../application/use-cases/ListPendingInstructors";
import { ApproveInstructorUseCase } from "../../application/use-cases/ApproveInstructor";
import { DeclineInstructorUseCase } from "../../application/use-cases/DeclineInstructor";
import { ListApprovedInstructorsUseCase } from "../../application/use-cases/ListApprovedInstructors";

import { NodeMailerService } from "../../../../shared/services/mail/NodeMailerService";

import { MongoInstructorRepository } from "../../infrastructure/repositories/MongoInstructorRepository";
import { ChangeInstructorStatusUseCase } from "../../application/use-cases/ChangeAccountStatus";
const instructorRepo = new MongoInstructorRepository();

const nodeMalierUc = new NodeMailerService()

const listPendingUC = new ListPendingInstructorsUseCase(instructorRepo)
const approveUC = new ApproveInstructorUseCase(instructorRepo,nodeMalierUc)
const declineUC = new DeclineInstructorUseCase(instructorRepo,nodeMalierUc)
const listApprovedUC = new ListApprovedInstructorsUseCase(instructorRepo)
const changeAccountStatusUC = new ChangeInstructorStatusUseCase(instructorRepo,nodeMalierUc)

export const adminInstructorController = new AdminInstructorController(
    listPendingUC,
    approveUC,
    declineUC,
    listApprovedUC,
    changeAccountStatusUC
)
