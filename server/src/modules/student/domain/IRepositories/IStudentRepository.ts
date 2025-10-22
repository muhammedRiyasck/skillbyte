import { Student } from "../entities/Student";
import { PaginatedResult } from "../../../../shared/types/PaginationType";

export interface IStudentRepository  {
  save(user: Student): Promise<void>;
  findByEmail(email: string): Promise<Student | null>;
  findById(id: string): Promise<Student | null>;
  findByIdAndUpdatePassword(id:string,password:string):Promise<{name:string,email:string}|void>;
  findAll(): Promise<Student[]|null>;
  listPaginated(
    filter: Record<string, any>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>
  ): Promise<{ data: Student[]; total: number }>;
  changeStatus(id: string, status: "active" | "blocked"): Promise<void>;
}
