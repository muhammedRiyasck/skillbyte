import { AdminInstructorController } from "../controllers/AdminInstructorController";

import { ListInstructorsUseCase } from "../../application/use-cases/ListInstructorsUseCase";
import { ApproveInstructorUseCase } from "../../application/use-cases/ApproveInstructorUseCase";
import { DeclineInstructorUseCase } from "../../application/use-cases/DeclineInstructorUseCase";
import { NodeMailerService } from "../../../../shared/services/mail/NodeMailerService";

import { MongoInstructorRepository } from "../../infrastructure/repositories/MongoInstructorRepository";
import { ChangeInstructorStatusUseCase } from "../../application/use-cases/ChangeInstructorStatusUseCase";
import { DeleteInstructorUseCase } from "../../application/use-cases/DeleteInstructorUseCase";
const instructorRepo = new MongoInstructorRepository();

const nodeMalierUc = new NodeMailerService()

const listInstructorUC = new ListInstructorsUseCase(instructorRepo)
const approveUC = new ApproveInstructorUseCase(instructorRepo,nodeMalierUc)
const declineUC = new DeclineInstructorUseCase(instructorRepo,nodeMalierUc)
const changeInstructorStatusUC = new ChangeInstructorStatusUseCase(instructorRepo,nodeMalierUc)
const deleteInstructorUC = new DeleteInstructorUseCase(instructorRepo)  

export const adminInstructorController = new AdminInstructorController(
    listInstructorUC,
    approveUC,
    declineUC,
    changeInstructorStatusUC,
    deleteInstructorUC
)
