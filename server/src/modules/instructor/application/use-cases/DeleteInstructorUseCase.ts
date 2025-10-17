import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IDeleteInstructorUseCase } from '../interfaces/IDeleteInstructorUseCase';

/**
 * Use case for deleting an instructor.
 * Handles the deletion of an instructor by their ID.
 */
export class DeleteInstructorUseCase implements IDeleteInstructorUseCase {
  /**
   * Constructs the DeleteInstructorUseCase.
   * @param repo - The instructor repository for data operations.
   */
  constructor(private repo: IInstructorRepository) {}

  /**
   * Executes the instructor deletion.
   * Deletes the instructor with the specified ID.
   * @param id - The ID of the instructor to delete.
   * @throws Error if the deletion fails.
   */
  async execute(id: string): Promise<void> {
    await this.repo.deleteById(id);
  }
}
