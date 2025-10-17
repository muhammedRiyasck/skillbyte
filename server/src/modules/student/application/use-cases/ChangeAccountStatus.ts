import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IChangeStudentStatusUseCase } from '../interfaces/IChangeStudentStatusUseCase';

/**
 * Use case for changing a student's account status.
 * Handles activation or blocking of student accounts.
 */
export class ChangeStudentStatusUseCase implements IChangeStudentStatusUseCase {
  /**
   * Constructs the ChangeStudentStatusUseCase.
   * @param repo - The student repository for data operations.
   */
  constructor(private repo: IStudentRepository) {}

  /**
   * Executes the status change for a student.
   * Updates the student's account status to active or blocked.
   * @param id - The ID of the student.
   * @param status - The new status ('active' or 'blocked').
   * @throws Error if the status change fails.
   */
  async execute(id: string, status: 'active' | 'blocked'): Promise<void> {
    return await this.repo.changeStatus(id, status);
  }
}
