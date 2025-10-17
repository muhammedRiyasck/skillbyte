import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IGetInstructorProfileUseCase } from '../interfaces/IGetInstructorProfileUseCase';
import { Instructor } from '../../domain/entities/Instructor';

/**
 * Use case for retrieving an instructor's profile.
 * Fetches the instructor details by their ID.
 */
export class GetInstructorProfileUseCase implements IGetInstructorProfileUseCase {
  /**
   * Constructs the GetInstructorProfileUseCase.
   * @param instructorRepository - The instructor repository for data operations.
   */
  constructor(private readonly instructorRepository: IInstructorRepository) {}

  /**
   * Executes the retrieval of an instructor's profile.
   * Finds and returns the instructor with the specified ID.
   * @param id - The ID of the instructor to retrieve.
   * @returns A promise that resolves to the Instructor entity or null if not found.
   * @throws Error if the retrieval fails.
   */
  async execute(id: string): Promise<Instructor | null> {
    return await this.instructorRepository.findById(id);
  }
}
