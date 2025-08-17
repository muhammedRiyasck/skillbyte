import { Instructor } from '../entities/Instructor';

export interface IInstructorRepository {
  save(instructor: Instructor): Promise<void>;
  findByEmail(email: string): Promise<Instructor | null>;
  findById(id: string): Promise<Instructor | null>;
  // findByIdAndUpdate(id:string,playload:Instructor):Promise<void>;
  findByIdAndUpdatePassword(id:string,password:string):Promise<{name:string,email:string}|void>;
  listPending(): Promise<Instructor[]|null>;
  approve(id: string, adminId: string): Promise<void>;
  decline(id: string, note: string): Promise<void>;
  findAllApproved():Promise<Instructor[]|null>;
  changeStatus(id: string, status: "active" | "suspended"): Promise<void>;

}
