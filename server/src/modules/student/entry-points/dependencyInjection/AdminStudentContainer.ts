import { AdminStudentController } from "../controllers/AdminStudentController";
import { ListAllStudentsUseCase } from "../../application/use-cases/ListAllStudents";
import { MongoStudentRepository } from "../../infrastructure/repositories/MongoStudentRepository";
import { ChangeStudentStatusUseCase } from "../../application/use-cases/ChangeAccountStatus";
import { GetPaginatedStudentsUseCase } from "../../application/use-cases/GetPaginatedStudentsUseCase";

const studentRepo = new MongoStudentRepository()
const changeAccountStatusUC = new ChangeStudentStatusUseCase(studentRepo)
const getPaginatedStudentsUC = new GetPaginatedStudentsUseCase(studentRepo)

export const adminStudentController = new AdminStudentController(
        getPaginatedStudentsUC,
        changeAccountStatusUC
)

