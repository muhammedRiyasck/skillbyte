import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { Student } from '../entities/Student';
import { UserAccountStatus } from '../../../../shared/enums/UserAccountStatus';

export interface IStudentRepository extends IBaseRepository<Student> {
  findByEmail(email: string): Promise<Student | null>;
  findByIdAndUpdatePassword(
    id: string,
    password: string,
  ): Promise<{ name: string; email: string } | void>;
  changeStatus(id: string, status: UserAccountStatus): Promise<void>;
  updateProfile(id: string, updates: Partial<Student>): Promise<void>;
  recordActivity(id: string, xpEarned?: number): Promise<Student>;
}
