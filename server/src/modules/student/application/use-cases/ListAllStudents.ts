import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IListAllStudentsUseCase } from '../interfaces/IListAllStudentsUseCase';
import { StudentResponseDto } from '../dtos/StudentResponseDto';
import { StudentMapper } from '../mappers/StudentMapper';

/** Executes the business logic for list all students. */
export class ListAllStudentsUseCase implements IListAllStudentsUseCase {
  /**
   * Constructs the ListAllStudentsUseCase.
   * @param repo - The student repository for data operations.
   */
  constructor(private _studentRepo: IStudentRepository) {}

  /**
   * Execute for the ListAllStudents entity.
   *
   * @returns The standardized HTTP response.
   */
  async execute(): Promise<StudentResponseDto[] | null> {
    const docs = await this._studentRepo.findAll();

    if (!docs) return null;
    return docs.map((student) => StudentMapper.toResponseDto(student));
  }
}
