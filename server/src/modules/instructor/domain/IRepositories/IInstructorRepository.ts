import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { Instructor } from '../entities/Instructor';

export interface IInstructorRepository extends IBaseRepository<Instructor> {
  findByEmail(email: string): Promise<Instructor | null>;
  findByIdAndUpdatePassword(
    id: string,
    password: string,
  ): Promise<{ name: string; email: string } | void>;
  approve(id: string, adminId: string): Promise<void>;
  decline(id: string, adminId: string, note: string): Promise<void>;
  findAllApproved(): Promise<Instructor[] | null>;
  changeInstructorStatus(
    id: string,
    status: 'active' | 'suspended',
    note?: string,
  ): Promise<void>;
  updateById(id: string, updates: Partial<Instructor>): Promise<void>;
}
