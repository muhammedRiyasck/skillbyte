import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IListAllStudentsUseCase } from '../interfaces/IListAllStudentsUseCase';
import { StudentResponseDto } from '../dtos/StudentResponseDto';
import { StudentMapper } from '../mappers/StudentMapper';

/**
 * Use case for listing all students.
 * Retrieves a list of all student entities from the repository.
 */
export class ListAllStudentsUseCase implements IListAllStudentsUseCase {
  /**
   * Constructs the ListAllStudentsUseCase.
   * @param repo - The student repository for data operations.
   */
  constructor(private _studentRepo: IStudentRepository) {}

  /**
   * Executes the retrieval of all students.
   * Fetches all student documents from the repository.
   * @returns A promise that resolves to an array of StudentResponseDto or null if none found.
   * @throws Error if the retrieval fails.
   */
  async execute(): Promise<StudentResponseDto[] | null> {
    const docs = await this._studentRepo.findAll();

    if (!docs) return null;
    return docs.map((student) => StudentMapper.toResponseDto(student));
  }
}
