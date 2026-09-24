import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IGetInstructorProfileUseCase } from '../interfaces/IGetInstructorProfileUseCase';
import { InstructorResponseDto } from '../dtos/InstructorResponseDto';
import { InstructorMapper } from '../mappers/InstructorMapper';

/** Executes the business logic for get instructor profile. */
export class GetInstructorProfileUseCase
  implements IGetInstructorProfileUseCase
{
  /**
   * Constructs the GetInstructorProfileUseCase.
   * @param _instructorRepo - The instructor repository for data operations.
   */
  constructor(private readonly _instructorRepo: IInstructorRepository) {}

  /**
   * Execute for the GetInstructorProfile entity.
   *
   * @param id - The unique identifier for the id.
   * @returns The standardized HTTP response.
   */
  async execute(id: string): Promise<InstructorResponseDto | null> {
    const instructor = await this._instructorRepo.findById(id);
    return instructor ? InstructorMapper.toResponseDto(instructor) : null;
  }
}
