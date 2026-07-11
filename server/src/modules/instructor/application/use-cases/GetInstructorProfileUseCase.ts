import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IGetInstructorProfileUseCase } from '../interfaces/IGetInstructorProfileUseCase';
import { InstructorResponseDto } from '../dtos/InstructorResponseDto';
import { InstructorMapper } from '../mappers/InstructorMapper';

/**
 * Use case for retrieving an instructor's profile.
 * Fetches the instructor details by their ID.
 */
export class GetInstructorProfileUseCase
  implements IGetInstructorProfileUseCase
{
  /**
   * Constructs the GetInstructorProfileUseCase.
   * @param _instructorRepo - The instructor repository for data operations.
   */
  constructor(private readonly _instructorRepo: IInstructorRepository) {}

  /**
   * Executes the retrieval of an instructor's profile.
   * Finds and returns the instructor with the specified ID.
   * @param id - The ID of the instructor to retrieve.
   * @returns A promise that resolves to the InstructorResponseDto or null if not found.
   * @throws Error if the retrieval fails.
   */
  async execute(id: string): Promise<InstructorResponseDto | null> {
    const instructor = await this._instructorRepo.findById(id);
    return instructor ? InstructorMapper.toResponseDto(instructor) : null;
  }
}
