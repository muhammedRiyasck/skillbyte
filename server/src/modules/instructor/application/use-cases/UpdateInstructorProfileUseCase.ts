import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IUpdateInstructorProfileUseCase } from '../interfaces/IUpdateInstructorProfileUseCase';
import { InstructorMapper } from '../mappers/InstructorMapper';
import { InstructorProfileUpdateRequestDto } from '../dtos/InstructorRequestDto';

/** Executes the business logic for update instructor profile. */
export class UpdateInstructorProfileUseCase
  implements IUpdateInstructorProfileUseCase
{
  constructor(private readonly _instructorRepo: IInstructorRepository) {}

  /**
   * Execute for the UpdateInstructorProfile entity.
   *
   * @param id - The unique identifier for the id.
   * @param dto - The data transfer object containing request details.
   */
  async execute(
    id: string,
    dto: InstructorProfileUpdateRequestDto,
  ): Promise<void> {
    const updates = InstructorMapper.toUpdateProfileEntity(dto);
    await this._instructorRepo.updateById(id, updates);
  }
}
