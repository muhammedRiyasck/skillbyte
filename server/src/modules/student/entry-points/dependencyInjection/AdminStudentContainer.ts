import { AdminStudentController } from "../controllers/AdminStudentController";
import { StudentRepository } from "../../infrastructure/repositories/StudentRepository";
import { ChangeStudentStatusUseCase } from "../../application/use-cases/ChangeAccountStatus";
import { GetPaginatedStudentsUseCase } from "../../application/use-cases/GetPaginatedStudentsUseCase";

const studentRepo = new StudentRepository()
const changeAccountStatusUC = new ChangeStudentStatusUseCase(studentRepo)
const getPaginatedStudentsUC = new GetPaginatedStudentsUseCase(studentRepo)

export const adminStudentController = new AdminStudentController(
        getPaginatedStudentsUC,
        changeAccountStatusUC
)

