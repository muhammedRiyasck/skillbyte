import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IGetStudentProfileUseCase } from '../interfaces/IGetStudentProfileUseCase';
import { StudentResponseDto } from '../dtos/StudentResponseDto';
import { StudentMapper } from '../mappers/StudentMapper';

/** Executes the business logic for get student profile. */
export class GetStudentProfileUseCase implements IGetStudentProfileUseCase {
  constructor(private readonly _studentRepo: IStudentRepository) {}

  /**
   * Execute for the GetStudentProfile entity.
   *
   * @param id - The unique identifier for the id.
   * @returns The standardized HTTP response.
   */
  async execute(id: string): Promise<StudentResponseDto | null> {
    const student = await this._studentRepo.findById(id);
    return student ? StudentMapper.toResponseDto(student) : null;
  }
}
