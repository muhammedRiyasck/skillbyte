
import { Student } from "../../domain/entities/Student";

export interface IListAllStudentsUseCase{
execute(): Promise<Student[]|null>
}
