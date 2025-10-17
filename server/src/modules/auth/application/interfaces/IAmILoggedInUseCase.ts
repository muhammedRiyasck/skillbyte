import { Admin } from "../../../admin/domain/entities/Admin";
import { Instructor } from "../../../instructor/domain/entities/Instructor";
import { Student } from "../../../student/domain/entities/Student";

export interface IAmILoggedInUseCase {
  execute(id:string,role:string):Promise<Student|Instructor|Admin|null> 
}
