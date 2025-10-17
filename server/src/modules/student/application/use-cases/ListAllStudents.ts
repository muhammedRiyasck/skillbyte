import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { Student } from '../../domain/entities/Student';
import { IListAllStudentsUseCase } from '../interfaces/IListAllStudentsUseCase';

/**
 * Use case for listing all students.
 * Retrieves a list of all student entities from the repository.
 */
export class ListAllStudentsUseCase implements IListAllStudentsUseCase {
  /**
   * Constructs the ListAllStudentsUseCase.
   * @param repo - The student repository for data operations.
   */
  constructor(private repo: IStudentRepository) {}

  /**
   * Executes the retrieval of all students.
   * Fetches all student documents from the repository.
   * @returns A promise that resolves to an array of Student entities or null if none found.
   * @throws Error if the retrieval fails.
   */
  async execute(): Promise<Student[] | null> {
    const docs = await this.repo.findAll();

    if (!docs) return null;
    return docs;
  }
}
