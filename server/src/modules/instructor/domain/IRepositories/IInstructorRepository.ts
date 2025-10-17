import { Instructor } from '../entities/Instructor';

export interface IInstructorRepository {
  save(instructor: Instructor): Promise<void>;
  findByEmail(email: string): Promise<Instructor | null>;
  findById(id: string): Promise<Instructor | null>;
  findByIdAndUpdatePassword(id:string,password:string):Promise<{name:string,email:string}|void>;
  listPaginatedInstructor(
      filter: Record<string, any>,         
      page: number,
      limit: number,
      sort: Record<string, 1 | -1> 
    ): Promise<{ data: Instructor[]; total: number }>
  approve(id: string, adminId: string): Promise<void>;
  decline(id: string, adminId:string, note: string): Promise<void>;
  findAllApproved():Promise<Instructor[]|null>;
  changeInstructorStatus(id: string, status: "active" | "suspended", note?:string): Promise<void>;
  deleteById(id: string): Promise<void>;
  updateById(id: string, updates: Partial<Instructor>): Promise<void>;
}
