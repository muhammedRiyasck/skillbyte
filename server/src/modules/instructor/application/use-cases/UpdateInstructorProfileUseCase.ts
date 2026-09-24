import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IUpdateInstructorProfileUseCase } from '../interfaces/IUpdateInstructorProfileUseCase';
import { InstructorMapper } from '../mappers/InstructorMapper';
import { InstructorProfileUpdateRequestDto } from '../dtos/InstructorRequestDto';

export class UpdateInstructorProfileUseCase
  implements IUpdateInstructorProfileUseCase
{
  constructor(private readonly _instructorRepo: IInstructorRepository) {}

  async execute(id: string, dto: InstructorProfileUpdateRequestDto): Promise<void> {
    const updates = InstructorMapper.toUpdateProfileEntity(dto);
    await this._instructorRepo.updateById(id, updates);
  }
}
