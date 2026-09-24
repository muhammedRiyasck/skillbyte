import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IUpdateStudentProfileUseCase } from '../interfaces/IUpdateStudentProfileUseCase';
import { Student } from '../../domain/entities/Student';

/** Executes the business logic for update student profile. */
export class UpdateStudentProfileUseCase
  implements IUpdateStudentProfileUseCase
{
  constructor(private readonly _studentRepo: IStudentRepository) {}

  /**
   * Execute for the UpdateStudentProfile entity.
   *
   * @param id - The unique identifier for the id.
   * @param updates - The updates information.
   */
  async execute(id: string, updates: Partial<Student>): Promise<void> {
    await this._studentRepo.updateProfile(id, updates);
  }
}
