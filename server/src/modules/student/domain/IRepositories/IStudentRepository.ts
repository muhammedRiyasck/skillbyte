import { Student } from "../entities/Student";

export interface IStudentRepository  {
  save(user: Student): Promise<void>;
  findByEmail(email: string): Promise<Student | null>;
  findById(id: string): Promise<Student | null>;
  // findByIdAndUpdate(id:string,playload:Student):Promise<void>;
  findByIdAndUpdatePassword(id:string,password:string):Promise<{name:string,email:string}|void>;
  findAll(): Promise<Student[]|null>;
  changeStatus(id: string, status: "active" | "blocked"): Promise<void>;

}
// This interface defines the methods for interacting with the authentication user repository.
