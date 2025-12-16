import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IUpdateInstructorProfileUseCase } from '../interfaces/IUpdateInstructorProfileUseCase';
import { Instructor } from '../../domain/entities/Instructor';

export class UpdateInstructorProfileUseCase
  implements IUpdateInstructorProfileUseCase
{
  constructor(private readonly _instructorRepo: IInstructorRepository) {}

  async execute(id: string, updates: Partial<Instructor>): Promise<void> {
    await this._instructorRepo.updateById(id, updates);
  }
}
