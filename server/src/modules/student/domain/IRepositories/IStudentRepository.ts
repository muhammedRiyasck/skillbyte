import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { Student } from '../entities/Student';

export interface IStudentRepository extends IBaseRepository<Student> {
  findByEmail(email: string): Promise<Student | null>;
  findByIdAndUpdatePassword(
    id: string,
    password: string,
  ): Promise<{ name: string; email: string } | void>;
  changeStatus(id: string, status: 'active' | 'blocked'): Promise<void>;
}
