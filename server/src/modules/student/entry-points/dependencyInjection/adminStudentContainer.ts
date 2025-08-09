import { AdminStudentController } from "../controllers/adminStudentController";
import { ListAllStudentsUseCase } from "../../application/use-cases/ListAllStudents";
import { MongoStudentRepository } from "../../infrastructure/repositories/MongoStudentRepository"; 
import { ChangeStudentStatusUseCase } from "../../application/use-cases/ChangeAccountStatus";

const studentRepo = new MongoStudentRepository()
const listAllStudentsUc = new ListAllStudentsUseCase(studentRepo)
const changeAccountStatusUC = new ChangeStudentStatusUseCase(studentRepo)
export const adminStudentController = new AdminStudentController(
        listAllStudentsUc,
        changeAccountStatusUC
)
