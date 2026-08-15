import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IUpdateStudentProfileUseCase } from '../interfaces/IUpdateStudentProfileUseCase';
import { Student } from '../../domain/entities/Student';

/**
 * Use case for updating a student's profile (name and/or profile picture).
 */
export class UpdateStudentProfileUseCase
  implements IUpdateStudentProfileUseCase
{
  constructor(private readonly _studentRepo: IStudentRepository) {}

  async execute(
    id: string,
    updates: Partial<Pick<Student, 'name' | 'profilePictureUrl'>>,
  ): Promise<void> {
    await this._studentRepo.updateProfile(id, updates);
  }
}
